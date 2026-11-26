-- Melden von Nutzerinhalten (Apple App Review 1.2 / Google Play UGC-Regeln, DSA Art. 16).
-- Nutzer können Nachrichten, Crew-Posts, Profile und Gruppen melden.
-- Lesen dürfen nur Admins (private.is_admin()); Nutzer sehen ihre Meldungen nicht wieder.
-- Bearbeitung: Jannik prüft offene Meldungen täglich (Ziel: innerhalb 24 h), Status von Hand setzen.

create table if not exists public.reports (
  id          bigint generated always as identity primary key,
  reporter    uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_user uuid references auth.users(id) on delete set null,
  kind        text not null check (kind in ('message', 'crew_post', 'profile', 'group')),
  ref_id      bigint,
  reason      text not null check (reason in ('harass', 'hate', 'sexual', 'violence', 'scam', 'spam', 'minor', 'other')),
  note        text check (char_length(note) <= 500),
  snippet     text check (char_length(snippet) <= 500),   -- Kopie des gemeldeten Textes, falls er gelöscht wird
  status      text not null default 'open' check (status in ('open', 'done', 'dismissed')),
  created_at  timestamptz not null default now()
);

create index if not exists reports_open on public.reports(status, created_at desc);

alter table public.reports enable row level security;

drop policy if exists reports_insert_own on public.reports;
create policy reports_insert_own on public.reports
  for insert to authenticated
  with check (reporter = auth.uid() and status = 'open');

drop policy if exists reports_admin_read on public.reports;
create policy reports_admin_read on public.reports
  for select to authenticated
  using (private.is_admin());

drop policy if exists reports_admin_update on public.reports;
create policy reports_admin_update on public.reports
  for update to authenticated
  using (private.is_admin())
  with check (private.is_admin());

revoke all on public.reports from anon;
grant insert on public.reports to authenticated;
grant select, update on public.reports to authenticated;

-- Schutz gegen Massen-Meldungen: max. 20 pro Stunde und Person.
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
