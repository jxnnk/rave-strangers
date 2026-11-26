-- 027: Events nach dem Abend bewerten + Check-in vor Ort
-- * Bewerten darf, wer auf "Ich gehe hin" getippt hat (Policy rv_insert gibt es schon), bis 21 Tage nach dem Event.
-- * Check-in: in der Event-Nacht einmal "Ich bin da" -> Server prüft Abstand zum Club (max. 400 m).
--   Der Standort wird NICHT gespeichert, nur dass jemand eingecheckt hat (Tabelle checkins).
-- * Bewertungen von Eingecheckten bekommen verified=true und zählen im Score doppelt.
-- * Am Tag nach dem Event: Benachrichtigung "Wie war's?" an alle, die hingehen wollten und noch nicht bewertet haben.

alter table public.reviews add column if not exists lineup    int check (lineup    between 1 and 5);
alter table public.reviews add column if not exists awareness int check (awareness between 1 and 5);
alter table public.reviews add column if not exists verified  boolean not null default false;

create table if not exists public.checkins (
  event_id   bigint not null references public.events(id) on delete cascade,
  profile_id uuid   not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);
alter table public.checkins enable row level security;
create policy ci_read_own on public.checkins for select to authenticated using (profile_id = auth.uid());
-- kein insert/update/delete für Clients: nur über check_in()

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

-- Schutz: Club passend zum Event, verified nur vom Server, Event/Autor nicht nachträglich änderbar
create or replace function private.review_guard() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    new.event_id := old.event_id;
    new.author := old.author;
    new.updated_at := now();
  end if;
  if new.event_id is not null then
    select venue_id into new.venue_id from public.events where id = new.event_id;
    if tg_op = 'INSERT' and (select starts_at from public.events where id = new.event_id) < now() - interval '21 days' then
      raise exception 'review_closed';
    end if;
    new.verified := exists (select 1 from public.checkins c where c.event_id = new.event_id and c.profile_id = new.author);
  else
    new.verified := false;
  end if;
  return new;
end $$;
create trigger reviews_guard before insert or update on public.reviews
  for each row execute function private.review_guard();

create or replace view public.event_ratings with (security_invoker = true) as
  select event_id,
         round(avg(stars), 1) as avg,
         count(*)::int as n,
         (count(*) filter (where verified))::int as n_verified,
         round(sum(stars * case when verified then 2 else 1 end)::numeric / sum(case when verified then 2 else 1 end), 1) as score,
         round(avg(sound), 1) as sound, round(avg(crowd), 1) as crowd, round(avg(door), 1) as door,
         round(avg(safety), 1) as safety, round(avg(lineup), 1) as lineup, round(avg(awareness), 1) as awareness
  from public.reviews where event_id is not null group by event_id;
grant select on public.event_ratings to anon, authenticated;

create or replace view public.organizer_ratings with (security_invoker = true) as
  select eo.organizer_id,
         round(avg(r.stars), 1) as avg,
         count(*)::int as n,
         round(avg(r.sound), 1) as sound, round(avg(r.crowd), 1) as crowd, round(avg(r.door), 1) as door,
         round(avg(r.safety), 1) as safety, round(avg(r.lineup), 1) as lineup, round(avg(r.awareness), 1) as awareness
  from public.reviews r join public.event_organizers eo on eo.event_id = r.event_id
  group by eo.organizer_id;
grant select on public.organizer_ratings to anon, authenticated;

-- Benachrichtigung "Wie war's?"
alter table public.notifications drop constraint if exists notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check
  check (kind in ('tickets', 'new_event', 'reminder', 'review'));

create or replace function private.wants(p uuid, what text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select case what when 'tickets' then notify_tickets when 'new_event' then notify_new
                                    when 'reminder' then notify_reminder when 'review' then notify_reminder end
                   from public.user_settings where profile_id = p), true);
$$;

create or replace function private.notify_reviews() returns void
language sql security definer set search_path = public, private as $$
  insert into public.notifications (profile_id, kind, event_id, venue_id)
  select a.profile_id, 'review', e.id, e.venue_id
  from public.events e join public.attendance a on a.event_id = e.id
  where e.status = 'published'
    and e.starts_at between now() - interval '3 days' and now() - interval '10 hours'
    and private.wants(a.profile_id, 'review')
    and not exists (select 1 from public.reviews r where r.event_id = e.id and r.author = a.profile_id)
    and not exists (select 1 from public.notifications n
                    where n.profile_id = a.profile_id and n.event_id = e.id and n.kind = 'review');
$$;

select cron.schedule('rs-review-requests', '30 12 * * *', $$select private.notify_reviews()$$);
