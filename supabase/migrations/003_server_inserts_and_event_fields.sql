-- Events inserted by the server (seed, imports run with the service role) keep the status they are given.
create or replace function private.set_event_status() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if auth.uid() is null or is_admin() then return new; end if;
  if manages_venue(new.venue_id) then
    new.status := 'published'; new.origin := case when new.origin = 'feed' then 'feed' else 'organiser' end;
  elsif exists (select 1 from profiles where id = auth.uid() and role = 'artist' and verified) then
    new.status := 'published'; new.origin := 'artist';
  else
    new.status := 'pending'; new.origin := 'manual';
  end if;
  new.created_by := auth.uid();
  return new;
end $$;

alter table events
  add column if not exists time_known  boolean not null default true,   -- false: start time not announced
  add column if not exists lineup_more int     not null default 0;      -- "and N more" on the line-up
