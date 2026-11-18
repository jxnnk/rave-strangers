-- Creators may edit their own events, but not publish them themselves (review bypass),
-- nor change who created them / where they came from. Admins, venue managers and the server are exempt.
create or replace function private.guard_event_update() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if auth.uid() is null or private.is_admin() or private.manages_venue(new.venue_id) then return new; end if;
  if exists (select 1 from profiles where id = auth.uid() and role = 'artist' and verified) then
    new.created_by := old.created_by; new.origin := old.origin; return new;
  end if;
  new.status := case when new.status = 'cancelled' then 'cancelled'::event_status else old.status end;
  new.created_by := old.created_by;
  new.origin := old.origin;
  new.venue_id := old.venue_id;
  return new;
end $$;
revoke all on function private.guard_event_update() from public, anon, authenticated;
create or replace trigger events_update_guard before update on public.events for each row execute function private.guard_event_update();
