-- Hardening after the Supabase security advisor:
-- 1. Helper and trigger functions move to a schema that is NOT exposed through the REST API.
--    RLS policies keep working (they reference functions by id), but nobody can call them via /rpc.
-- 2. Only the two intended RPCs stay public, and only for signed-in users.
-- 3. citext moves out of the public schema; every function has a fixed search_path.

create schema if not exists private;
grant usage on schema private to anon, authenticated;

alter function public.is_admin()                    set schema private;
alter function public.manages_venue(bigint)         set schema private;
alter function public.in_conversation(bigint)       set schema private;
alter function public.is_blocked_between(uuid,uuid) set schema private;
alter function public.handle_new_user()             set schema private;
alter function public.set_event_status()            set schema private;
alter function public.protect_profile_fields()      set schema private;

-- Functions now call each other inside "private" and need it on their search_path.
alter function private.is_admin()                    set search_path = public, private;
alter function private.manages_venue(bigint)         set search_path = public, private;
alter function private.in_conversation(bigint)       set search_path = public, private;
alter function private.is_blocked_between(uuid,uuid) set search_path = public, private;
alter function private.handle_new_user()             set search_path = public, private;
alter function private.set_event_status()            set search_path = public, private;
alter function private.protect_profile_fields()      set search_path = public, private;
alter function public.approve_artist(bigint)         set search_path = public, private;
alter function public.start_chat(uuid)               set search_path = public, private;

-- Trigger functions: nobody calls them directly.
revoke execute on function private.handle_new_user()        from public, anon, authenticated;
revoke execute on function private.set_event_status()       from public, anon, authenticated;
revoke execute on function private.protect_profile_fields() from public, anon, authenticated;

-- Policy helpers: needed by RLS for every visitor, but not reachable through the API.
revoke execute on function private.is_admin()                    from public;
revoke execute on function private.manages_venue(bigint)         from public;
revoke execute on function private.in_conversation(bigint)       from public;
revoke execute on function private.is_blocked_between(uuid,uuid) from public;
grant  execute on function private.is_admin()                    to anon, authenticated;
grant  execute on function private.manages_venue(bigint)         to anon, authenticated;
grant  execute on function private.in_conversation(bigint)       to anon, authenticated;
grant  execute on function private.is_blocked_between(uuid,uuid) to anon, authenticated;

-- Public RPCs: signed-in users only (each checks permissions itself).
revoke execute on function public.approve_artist(bigint) from public, anon;
revoke execute on function public.start_chat(uuid)       from public, anon;
grant  execute on function public.approve_artist(bigint) to authenticated;
grant  execute on function public.start_chat(uuid)       to authenticated;

-- citext out of the public schema (the handle column keeps working).
create schema if not exists extensions;
alter extension citext set schema extensions;
