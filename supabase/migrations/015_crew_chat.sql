-- Crew finder + chat (tables existed; this adds limits, unread tracking and a chat list RPC)
create unique index if not exists crew_posts_one_per_event on public.crew_posts(event_id, author);
create index if not exists crew_posts_event on public.crew_posts(event_id, created_at desc);
create index if not exists messages_conv_time on public.messages(conversation_id, created_at desc);
create index if not exists cm_profile on public.conversation_members(profile_id);

alter table public.conversation_members add column if not exists last_read_at timestamptz not null default now();
revoke update on public.conversation_members from anon, authenticated;
grant update (last_read_at) on public.conversation_members to authenticated;
drop policy if exists cm_update on public.conversation_members;
create policy cm_update on public.conversation_members for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create or replace function private.msg_rate() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if (select count(*) from messages where sender = new.sender and created_at > now() - interval '10 minutes') >= 60 then
    raise exception 'rate_limited';
  end if;
  return new;
end $$;
drop trigger if exists messages_rate on public.messages;
create trigger messages_rate before insert on public.messages for each row execute function private.msg_rate();

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
  if (select count(*) from conversation_members cm join conversations c on c.id = cm.conversation_id
      where cm.profile_id = auth.uid() and c.created_at > now() - interval '1 hour') >= 10 then
    raise exception 'rate_limited';
  end if;
  insert into conversations default values returning id into cid;
  insert into conversation_members(conversation_id, profile_id) values (cid, auth.uid()), (cid, other);
  return cid;
end $$;

create or replace function public.my_chats()
returns table(conversation_id bigint, other_id uuid, other_handle text, other_name text, other_verified boolean,
              last_body text, last_at timestamptz, last_sender uuid, unread int)
language sql security definer stable set search_path = public, private as $$
  select me.conversation_id, o.profile_id, p.handle, p.display_name, p.verified,
         lm.body, lm.created_at, lm.sender,
         (select count(*)::int from messages m where m.conversation_id = me.conversation_id and m.sender <> auth.uid() and m.created_at > me.last_read_at)
  from conversation_members me
  join conversation_members o on o.conversation_id = me.conversation_id and o.profile_id <> me.profile_id
  join profiles p on p.id = o.profile_id
  left join lateral (select body, created_at, sender from messages m where m.conversation_id = me.conversation_id order by created_at desc limit 1) lm on true
  where me.profile_id = auth.uid() and not private.is_blocked_between(auth.uid(), o.profile_id)
  order by coalesce(lm.created_at, now()) desc;
$$;
revoke all on function public.my_chats() from public, anon;
grant execute on function public.my_chats() to authenticated;
