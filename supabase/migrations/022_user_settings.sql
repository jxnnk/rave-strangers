-- 022: Personal settings (notifications, privacy). Missing row = all defaults (everything on).
create table if not exists public.user_settings (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  notify_tickets boolean not null default true,   -- ticket alert / tickets are out
  notify_new boolean not null default true,       -- new dates at followed clubs
  notify_reminder boolean not null default true,  -- reminder the day before
  dm_open boolean not null default true,          -- strangers may start a chat with me
  going_visible boolean not null default true,    -- default for "Ich gehe hin" visibility
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
create policy us_all on public.user_settings for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
revoke all on public.user_settings from anon;

create or replace function private.wants(p uuid, what text) returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select case what when 'tickets' then notify_tickets when 'new_event' then notify_new
                                    when 'reminder' then notify_reminder end
                   from public.user_settings where profile_id = p), true);
$$;

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
  where private.wants(u.pid, 'tickets')
    and not exists (select 1 from public.notifications n
                    where n.profile_id = u.pid and n.event_id = new.id and n.kind = 'tickets'
                      and n.created_at > now() - interval '3 days');
  return new;
end $$;

create or replace function private.notify_new_event() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if new.status <> 'published' or new.starts_at < now() then return new; end if;
  if tg_op = 'UPDATE' and old.status = 'published' then return new; end if;
  insert into public.notifications (profile_id, kind, event_id, venue_id)
  select f.profile_id, 'new_event', new.id, new.venue_id
  from public.venue_follows f
  where f.venue_id = new.venue_id
    and private.wants(f.profile_id, 'new_event')
    and not exists (select 1 from public.notifications n
                    where n.profile_id = f.profile_id and n.venue_id = new.venue_id and n.kind = 'new_event'
                      and n.created_at > now() - interval '12 hours');
  return new;
end $$;

create or replace function private.notify_reminders() returns void
language sql security definer set search_path = public, private as $$
  insert into public.notifications (profile_id, kind, event_id, venue_id)
  select distinct u.pid, 'reminder', e.id, e.venue_id
  from public.events e
  join (select event_id, profile_id pid from public.attendance
        union select event_id, profile_id from public.bookmarks) u on u.event_id = e.id
  where e.status = 'published'
    and (e.starts_at at time zone 'Europe/Berlin')::date = (now() at time zone 'Europe/Berlin')::date + 1
    and private.wants(u.pid, 'reminder')
    and not exists (select 1 from public.notifications n
                    where n.profile_id = u.pid and n.event_id = e.id and n.kind = 'reminder');
$$;

-- New chats respect "dm_open"; existing chats keep working.
create or replace function public.start_chat(other uuid) returns bigint
language plpgsql security definer set search_path = public, private as $$
declare cid bigint;
begin
  if auth.uid() is null or other = auth.uid() then raise exception 'invalid'; end if;
  if is_blocked_between(auth.uid(), other) then raise exception 'blocked'; end if;
  select a.conversation_id into cid from conversation_members a
    join conversation_members b on a.conversation_id = b.conversation_id
    where a.profile_id = auth.uid() and b.profile_id = other limit 1;
  if cid is not null then return cid; end if;
  if not coalesce((select dm_open from user_settings where profile_id = other), true) then
    raise exception 'dm_closed';
  end if;
  if (select count(*) from conversation_members cm join conversations c on c.id = cm.conversation_id
      where cm.profile_id = auth.uid() and c.created_at > now() - interval '1 hour') >= 10 then
    raise exception 'rate_limited';
  end if;
  insert into conversations default values returning id into cid;
  insert into conversation_members(conversation_id, profile_id) values (cid, auth.uid()), (cid, other);
  return cid;
end $$;
revoke execute on function public.start_chat(uuid) from anon;

-- Blocked people list for the settings page (only own blocks, with names).
create or replace function public.my_blocks() returns table(blocked uuid, handle text, display_name text)
language sql stable security definer set search_path = public as $$
  select b.blocked, p.handle::text, p.display_name from blocks b join profiles p on p.id = b.blocked
  where b.blocker = auth.uid() order by b.created_at desc;
$$;
revoke execute on function public.my_blocks() from anon;
