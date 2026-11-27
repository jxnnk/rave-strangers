-- 030: Fixes aus SECURITY_FINDINGS.md (Review vom 27.11.2026). Idempotent, ohne DROP TABLE/COLUMN, ohne DELETE.
--   1  Freigegebene Events: Titel/Ticket-Link/Quelle/Banner/Line-up ändern -> zurück in die Prüfung
--   2  Check-in: Server prüft den 400-m-Abstand selbst (Koordinaten werden nur verglichen, nie gespeichert)
--   3  Einladungslink: kein Zwangs-Chat, wenn blockiert oder "Fremde dürfen mir schreiben" aus ist
--   4  Gruppenchats: Blockieren schaltet niemanden stumm; Nachrichten blockierter Personen werden ausgeblendet
--   5  Posts: nachträglich nicht zu "News" oder fremdem Club umbaubar
--   6  Meldungen: Tabelle `reports` auf ein Schema bringen (altes aus schema.sql + neues aus 026)

-- ============ 1: Events nach Freigabe ============
-- Nicht-Admins dürfen eigene Events bearbeiten, aber nie selbst veröffentlichen.
-- Ändern sie bei einem veröffentlichten Event Titel, Ticket-Link, Quelle oder Banner, geht es erneut in die Prüfung.
-- Folge: Ticket- und Veranstalter-Benachrichtigungen (021/024) feuern nur für veröffentlichte Events,
-- also erst nach erneuter Freigabe.
create or replace function private.guard_event_update() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if auth.uid() is null or private.is_admin() then return new; end if;
  new.created_by := old.created_by;
  new.origin     := old.origin;
  new.venue_id   := old.venue_id;
  -- Line-up-Änderung (Trigger unten) zieht das Event zurück in die Prüfung.
  if current_setting('rs.rereview', true) = 'on' then
    new.status := 'pending'; return new;
  end if;
  if new.status = 'cancelled' then return new; end if;
  if old.status = 'published' and (
       new.title      is distinct from old.title
    or new.ticket_url is distinct from old.ticket_url
    or new.source_url is distinct from old.source_url
    or new.image_url  is distinct from old.image_url) then
    new.status := 'pending';
  else
    new.status := old.status;
  end if;
  return new;
end $$;
revoke all on function private.guard_event_update() from public, anon, authenticated;

-- Line-up eines veröffentlichten Events geändert (nicht direkt beim Anlegen) -> Event zurück in die Prüfung.
create or replace function private.lineup_rereview() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare eid bigint := coalesce(new.event_id, old.event_id);
begin
  if auth.uid() is null or private.is_admin() then return null; end if;
  if exists (select 1 from events where id = eid and status = 'published' and created_at < now() - interval '10 minutes') then
    perform set_config('rs.rereview', 'on', true);
    update events set status = 'pending' where id = eid;
    perform set_config('rs.rereview', 'off', true);
  end if;
  return null;
end $$;
revoke all on function private.lineup_rereview() from public, anon, authenticated;
drop trigger if exists event_lineup_rereview on public.event_lineup;
create trigger event_lineup_rereview after insert or update or delete on public.event_lineup
  for each row execute function private.lineup_rereview();

-- ============ 2: Check-in mit Abstandsprüfung auf dem Server ============
-- Die App schickt beim Check-in einmal die Position. Sie wird nur mit der Club-Position verglichen
-- und nirgends gespeichert oder geloggt (CLAUDE.md Regel 7). Die Variante nur mit Event-ID (028) ist gesperrt.
create or replace function public.check_in(p_event bigint, p_lat double precision, p_lon double precision)
returns text language plpgsql security definer set search_path = public, private as $$
declare e record; d double precision;
begin
  if auth.uid() is null then raise exception 'auth'; end if;
  if p_lat is null or p_lon is null or abs(p_lat) > 90 or abs(p_lon) > 180 then return 'bad_location'; end if;
  select ev.id, ev.starts_at, coalesce(ev.ends_at, ev.starts_at + interval '14 hours') as ends, v.lat, v.lon
    into e from public.events ev join public.venues v on v.id = ev.venue_id
   where ev.id = p_event and ev.status = 'published';
  if not found then return 'not_found'; end if;
  if now() < e.starts_at - interval '1 hour' or now() > e.ends + interval '2 hours' then return 'not_now'; end if;
  if e.lat is null or e.lon is null then return 'no_venue_location'; end if;
  d := 6371000 * 2 * asin(sqrt(power(sin(radians(p_lat - e.lat) / 2), 2)
        + cos(radians(e.lat)) * cos(radians(p_lat)) * power(sin(radians(p_lon - e.lon) / 2), 2)));
  if d > 400 then return 'too_far'; end if;
  insert into public.attendance (event_id, profile_id, visible)
  values (p_event, auth.uid(), coalesce((select going_visible from public.user_settings where profile_id = auth.uid()), true))
  on conflict do nothing;
  insert into public.checkins (event_id, profile_id) values (p_event, auth.uid()) on conflict do nothing;
  update public.reviews set verified = true where event_id = p_event and author = auth.uid();
  return 'ok';
end $$;
revoke all on function public.check_in(bigint, double precision, double precision) from public, anon;
grant execute on function public.check_in(bigint, double precision, double precision) to authenticated;
revoke all on function public.check_in(bigint) from public, anon, authenticated;

-- ============ 3: Einladungslink respektiert Blockieren und "Fremde dürfen mir schreiben" ============
create or replace function private.invite_connect() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare inviter uuid; cid bigint;
begin
  if new.ref like 'i-%' then
    select id into inviter from profiles where handle::text = substr(new.ref, 3);
    if inviter is not null and inviter <> new.user_id
       and not private.is_blocked_between(inviter, new.user_id)
       and coalesce((select dm_open from user_settings where profile_id = inviter), true)
       -- höchstens 20 neue 1:1-Chats pro Stunde für dieselbe Person (Wegwerf-Konten)
       and (select count(*) from conversation_members cm join conversations c on c.id = cm.conversation_id
            where cm.profile_id = inviter and c.event_id is null and c.created_at > now() - interval '1 hour') < 20
    then
      insert into conversations default values returning id into cid;
      insert into conversation_members(conversation_id, profile_id) values (cid, inviter), (cid, new.user_id);
    end if;
  end if;
  return new;
end $$;
revoke all on function private.invite_connect() from public, anon, authenticated;

-- ============ 4: Blockieren in Gruppenchats ============
-- Schreiben: Block-Prüfung nur noch in 1:1-Chats. In Event-Gruppen darf jedes Mitglied schreiben.
alter policy m_insert on public.messages with check (
  sender = auth.uid() and private.in_conversation(conversation_id)
  and (
    exists (select 1 from public.conversations c where c.id = messages.conversation_id and c.event_id is not null)
    or not exists (select 1 from public.conversation_members cm
                   where cm.conversation_id = messages.conversation_id
                     and cm.profile_id <> auth.uid() and private.is_blocked_between(auth.uid(), cm.profile_id))));
-- Lesen: Nachrichten von Personen, mit denen eine Blockierung besteht, sind unsichtbar (in beide Richtungen).
alter policy m_read on public.messages using (
  private.in_conversation(conversation_id)
  and (sender = auth.uid() or not private.is_blocked_between(auth.uid(), sender)));

-- ============ 5: Posts nachträglich nicht umbaubar ============
alter policy po_update on public.posts
  using (author = auth.uid() or private.is_admin())
  with check (private.is_admin() or (author = auth.uid() and (
       (kind = 'artist' and exists (select 1 from public.profiles where id = auth.uid() and role = 'artist' and verified))
    or (kind = 'club'   and venue_id is not null and private.manages_venue(venue_id)))));

-- ============ 6: Meldungen (reports) ============
-- schema.sql hatte reports schon (target_profile/target_event/details, status = request_status).
-- 026 wollte ein neues Schema, hat die Tabelle wegen "if not exists" aber nicht angelegt.
-- Hier: neue Spalten dazu, status auf text, alte Pflicht-Prüfung (genau ein Ziel) ersetzen.
alter table public.reports add column if not exists target_user uuid references auth.users(id) on delete set null;
alter table public.reports add column if not exists kind    text;
alter table public.reports add column if not exists ref_id  bigint;
alter table public.reports add column if not exists note    text;
alter table public.reports add column if not exists snippet text;
alter table public.reports add column if not exists details text;          -- alte Spalte, falls die Tabelle aus 026 stammt
alter table public.reports add column if not exists target_profile uuid references public.profiles(id) on delete set null;
alter table public.reports add column if not exists target_event bigint references public.events(id) on delete set null;

do $$
declare c record;
begin
  -- status: Enum request_status -> text (pending->open, approved->done, rejected->dismissed)
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'reports' and column_name = 'status' and udt_name = 'request_status') then
    alter table public.reports alter column status set default null;
    alter table public.reports alter column status type text using (
      case status::text when 'approved' then 'done' when 'rejected' then 'dismissed' else 'open' end);
  end if;
  alter table public.reports alter column status set default 'open';
  -- alte Prüfungen (genau ein Ziel; kind/reason/status/Länge aus 026) entfernen, neue folgen direkt unten
  for c in select conname from pg_constraint
           where conrelid = 'public.reports'::regclass and contype = 'c'
             and (pg_get_constraintdef(oid) ilike '%num_nonnulls%'
                  or pg_get_constraintdef(oid) ilike '%kind%' or pg_get_constraintdef(oid) ilike '%reason%'
                  or pg_get_constraintdef(oid) ilike '%status%' or pg_get_constraintdef(oid) ilike '%char_length%')
  loop
    execute format('alter table public.reports drop constraint %I', c.conname);
  end loop;
end $$;

-- Neue Regeln gelten für neue Meldungen (not valid: alte Zeilen bleiben unangetastet).
alter table public.reports add constraint reports_status_chk check (status in ('open', 'done', 'dismissed')) not valid;
alter table public.reports add constraint reports_kind_chk
  check (kind in ('message', 'crew_post', 'profile', 'group', 'event')) not valid;
alter table public.reports add constraint reports_reason_chk
  check (reason in ('harass', 'hate', 'sexual', 'violence', 'scam', 'spam', 'minor', 'wrong_info', 'other')) not valid;
alter table public.reports add constraint reports_text_len_chk
  check (char_length(coalesce(note, '')) <= 500 and char_length(coalesce(snippet, '')) <= 500) not valid;
create index if not exists reports_open on public.reports(status, created_at desc);

alter table public.reports enable row level security;
-- Policies vereinheitlichen: Nutzer melden nur als sie selbst und nur mit status 'open'; Admins lesen/bearbeiten.
do $$
begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'reports' and policyname = 'rp_insert') then
    alter policy rp_insert on public.reports with check (reporter = auth.uid() and status = 'open');
  end if;
end $$;
drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports for insert to authenticated
  with check (reporter = auth.uid() and status = 'open');
drop policy if exists reports_admin_read on public.reports;
create policy reports_admin_read on public.reports for select to authenticated using (private.is_admin());
drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update on public.reports for update to authenticated
  using (private.is_admin()) with check (private.is_admin());
revoke all on public.reports from anon;
grant insert, select, update on public.reports to authenticated;

-- Schutz gegen Massen-Meldungen (aus 026, falls dort nicht angekommen)
create or replace function private.report_rate() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if (select count(*) from public.reports where reporter = new.reporter and created_at > now() - interval '1 hour') >= 20 then
    raise exception 'rate_limited';
  end if;
  return new;
end $$;
drop trigger if exists reports_rate on public.reports;
create trigger reports_rate before insert on public.reports for each row execute function private.report_rate();
