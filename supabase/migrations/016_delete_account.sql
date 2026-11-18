-- Users can delete their own account (App Store / Play Store / DSGVO requirement).
-- Personal rows cascade via foreign keys; references without cascade are detached first.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, private, auth as $$
declare u uuid := auth.uid();
begin
  if u is null then raise exception 'not logged in'; end if;
  update public.events set created_by = null where created_by = u;
  update public.artist_verifications set reviewed_by = null where reviewed_by = u;
  update public.event_lineup set artist_id = null where artist_id = u;
  update public.venue_feeds set created_by = null where created_by = u;
  delete from auth.users where id = u;
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
