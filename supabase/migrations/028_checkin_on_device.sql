-- 028: Check-in ohne Koordinaten.
-- Datenschutz-Versprechen: "Dein Standort verlässt dein Gerät nicht". Der Abstand zum Club wird
-- deshalb in der App berechnet; der Server bekommt nur die Event-ID und prüft das Zeitfenster.
-- Die alte Variante mit Koordinaten (027) ist für Clients gesperrt.

create or replace function public.check_in(p_event bigint)
returns text language plpgsql security definer set search_path = public, private as $$
declare e record;
begin
  if auth.uid() is null then raise exception 'auth'; end if;
  select ev.id, ev.starts_at, coalesce(ev.ends_at, ev.starts_at + interval '14 hours') as ends
    into e from public.events ev where ev.id = p_event and ev.status = 'published';
  if not found then return 'not_found'; end if;
  if now() < e.starts_at - interval '1 hour' or now() > e.ends + interval '2 hours' then return 'not_now'; end if;
  insert into public.attendance (event_id, profile_id, visible)
  values (p_event, auth.uid(), coalesce((select going_visible from public.user_settings where profile_id = auth.uid()), true))
  on conflict do nothing;
  insert into public.checkins (event_id, profile_id) values (p_event, auth.uid()) on conflict do nothing;
  update public.reviews set verified = true where event_id = p_event and author = auth.uid();
  return 'ok';
end $$;
revoke all on function public.check_in(bigint) from public, anon;
grant execute on function public.check_in(bigint) to authenticated;

revoke execute on function public.check_in(bigint, double precision, double precision) from authenticated, public, anon;
