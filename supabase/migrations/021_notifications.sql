-- 021: In-app notifications (ticket release, new events at followed clubs, reminder the day before)
-- Texts are rendered in the app from kind + event, so they follow the user's language.
-- Push (FCM/APNs) can later read the same rows; push_tokens is prepared for that.

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  profile_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('tickets', 'new_event', 'reminder')),
  event_id bigint references public.events(id) on delete cascade,
  venue_id bigint references public.venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists notifications_profile_idx on public.notifications (profile_id, created_at desc);
create index if not exists notifications_event_idx on public.notifications (event_id);

alter table public.notifications enable row level security;
create policy n_read on public.notifications for select to authenticated using (profile_id = auth.uid());
create policy n_update on public.notifications for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
revoke all on public.notifications from anon;
revoke insert, update, delete on public.notifications from authenticated;
grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

-- Device tokens for real push later (Firebase Cloud Messaging). Only the owner sees their tokens.
create table if not exists public.push_tokens (
  token text primary key check (char_length(token) <= 500),
  profile_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('android', 'ios', 'web')),
  lang text not null default 'de' check (lang in ('de', 'en')),
  updated_at timestamptz not null default now()
);
alter table public.push_tokens enable row level security;
create policy pt_all on public.push_tokens for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
revoke all on public.push_tokens from anon;

-- Ticket release: tickets become available (or a ticket link appears) -> everyone who saved, set an alarm or goes.
create or replace function private.notify_tickets() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if new.status <> 'published' or new.starts_at < now() then return new; end if;
  if not (
    (coalesce(old.ticket_status, 'unknown') in ('unknown', 'sold_out') and new.ticket_status in ('available', 'few'))
    or (old.ticket_url is null and new.ticket_url is not null)
  ) then return new; end if;

  insert into public.notifications (profile_id, kind, event_id, venue_id)
  select u.pid, 'tickets', new.id, new.venue_id
  from (select profile_id pid from public.bookmarks where event_id = new.id
        union select profile_id from public.attendance where event_id = new.id) u
  where not exists (select 1 from public.notifications n
                    where n.profile_id = u.pid and n.event_id = new.id and n.kind = 'tickets'
                      and n.created_at > now() - interval '3 days');
  return new;
end $$;

create or replace trigger events_notify_tickets
  after update of ticket_status, ticket_url on public.events
  for each row execute function private.notify_tickets();

-- New event at a followed club: at most one note per club and person every 12 hours (nightly imports add many).
create or replace function private.notify_new_event() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if new.status <> 'published' or new.starts_at < now() then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'published' then return new; end if;

  insert into public.notifications (profile_id, kind, event_id, venue_id)
  select f.profile_id, 'new_event', new.id, new.venue_id
  from public.venue_follows f
  where f.venue_id = new.venue_id
    and not exists (select 1 from public.notifications n
                    where n.profile_id = f.profile_id and n.venue_id = new.venue_id and n.kind = 'new_event'
                      and n.created_at > now() - interval '12 hours');
  return new;
end $$;

create or replace trigger events_notify_new
  after insert or update of status on public.events
  for each row execute function private.notify_new_event();

-- Reminder the day before (run daily by pg_cron at 12:00 Berlin).
create or replace function private.notify_reminders() returns void
language sql security definer set search_path = public, private as $$
  insert into public.notifications (profile_id, kind, event_id, venue_id)
  select distinct u.pid, 'reminder', e.id, e.venue_id
  from public.events e
  join (select event_id, profile_id pid from public.attendance
        union select event_id, profile_id from public.bookmarks) u on u.event_id = e.id
  where e.status = 'published'
    and (e.starts_at at time zone 'Europe/Berlin')::date = (now() at time zone 'Europe/Berlin')::date + 1
    and not exists (select 1 from public.notifications n
                    where n.profile_id = u.pid and n.event_id = e.id and n.kind = 'reminder');
$$;

select cron.schedule('rs-reminders', '0 11 * * *', 'select private.notify_reminders();');
