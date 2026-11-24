-- 023: Crew group chat per event, personal invite links (?ref=i-<handle>), invite count.

alter table public.conversations add column if not exists event_id bigint references public.events(id) on delete cascade;
alter table public.conversations add column if not exists title text check (char_length(title) <= 120);
create unique index if not exists conversations_event_uidx on public.conversations(event_id) where event_id is not null;

-- Join (or create) the crew group of an event.
create or replace function public.join_event_chat(p_event bigint) returns bigint
language plpgsql security definer set search_path = public, private as $$
declare cid bigint; ev record;
begin
  if auth.uid() is null then raise exception 'invalid'; end if;
  select id, title, status into ev from events where id = p_event;
  if ev.id is null or ev.status <> 'published' then raise exception 'invalid'; end if;
  select id into cid from conversations where event_id = p_event;
  if cid is null then
    insert into conversations(event_id, title) values (p_event, left(ev.title, 120))
      on conflict (event_id) where event_id is not null do nothing returning id into cid;
    if cid is null then select id into cid from conversations where event_id = p_event; end if;
  end if;
  insert into conversation_members(conversation_id, profile_id) values (cid, auth.uid()) on conflict do nothing;
  return cid;
end $$;

-- Leave a group (1:1 chats are left by blocking).
create or replace function public.leave_chat(p_conv bigint) returns void
language sql security definer set search_path = public, private as $$
  delete from conversation_members
  where conversation_id = p_conv and profile_id = auth.uid()
    and exists (select 1 from conversations c where c.id = p_conv and c.event_id is not null);
$$;

-- Chat list incl. groups (replaces my_chats in the apps).
create or replace function public.my_chats2()
returns table(conversation_id bigint, is_group boolean, title text, event_id bigint, members int,
              other_id uuid, other_handle text, other_name text, other_verified boolean,
              last_body text, last_at timestamptz, last_sender uuid, last_sender_name text, unread int)
language sql stable security definer set search_path = public, private as $$
  select me.conversation_id, c.event_id is not null, c.title, c.event_id,
         (select count(*)::int from conversation_members x where x.conversation_id = me.conversation_id),
         o.profile_id, p.handle::text, p.display_name, p.verified,
         lm.body, lm.created_at, lm.sender, lp.display_name,
         (select count(*)::int from messages m where m.conversation_id = me.conversation_id
            and m.sender <> auth.uid() and m.created_at > me.last_read_at)
  from conversation_members me
  join conversations c on c.id = me.conversation_id
  left join lateral (select x.profile_id from conversation_members x
                     where x.conversation_id = me.conversation_id and x.profile_id <> me.profile_id
                       and c.event_id is null limit 1) o on true
  left join profiles p on p.id = o.profile_id
  left join lateral (select body, created_at, sender from messages m
                     where m.conversation_id = me.conversation_id order by created_at desc limit 1) lm on true
  left join profiles lp on lp.id = lm.sender
  where me.profile_id = auth.uid()
    and (c.event_id is not null or (o.profile_id is not null and not private.is_blocked_between(auth.uid(), o.profile_id)))
  order by coalesce(lm.created_at, c.created_at) desc;
$$;

-- Old list stays for old app versions, but only shows 1:1 chats.
create or replace function public.my_chats()
returns table(conversation_id bigint, other_id uuid, other_handle text, other_name text, other_verified boolean,
              last_body text, last_at timestamptz, last_sender uuid, unread integer)
language sql stable security definer set search_path = public, private as $$
  select me.conversation_id, o.profile_id, p.handle, p.display_name, p.verified,
         lm.body, lm.created_at, lm.sender,
         (select count(*)::int from messages m where m.conversation_id = me.conversation_id and m.sender <> auth.uid() and m.created_at > me.last_read_at)
  from conversation_members me
  join conversations c on c.id = me.conversation_id and c.event_id is null
  join conversation_members o on o.conversation_id = me.conversation_id and o.profile_id <> me.profile_id
  join profiles p on p.id = o.profile_id
  left join lateral (select body, created_at, sender from messages m where m.conversation_id = me.conversation_id order by created_at desc limit 1) lm on true
  where me.profile_id = auth.uid() and not private.is_blocked_between(auth.uid(), o.profile_id)
  order by coalesce(lm.created_at, now()) desc;
$$;

-- Invite link: someone signs up via ?ref=i-<handle> -> both land in a shared chat right away.
create or replace function private.invite_connect() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare inviter uuid; cid bigint;
begin
  if new.ref like 'i-%' then
    select id into inviter from profiles where handle::text = substr(new.ref, 3);
    if inviter is not null and inviter <> new.user_id then
      insert into conversations default values returning id into cid;
      insert into conversation_members(conversation_id, profile_id) values (cid, inviter), (cid, new.user_id);
    end if;
  end if;
  return new;
end $$;
create or replace trigger signup_refs_invite after insert on private.signup_refs
  for each row execute function private.invite_connect();

create or replace function public.my_invites() returns int
language sql stable security definer set search_path = public, private as $$
  select count(*)::int from private.signup_refs
  where ref = 'i-' || (select handle::text from profiles where id = auth.uid());
$$;

revoke execute on function public.join_event_chat(bigint) from anon;
revoke execute on function public.leave_chat(bigint) from anon;
revoke execute on function public.my_chats2() from anon;
revoke execute on function public.my_invites() from anon;
