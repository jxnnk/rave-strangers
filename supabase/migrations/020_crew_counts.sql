-- Anonymous counts only (no names): how many people look for a crew / offer rides per upcoming event.
create or replace function public.crew_counts()
returns table(event_id bigint, crew int, rides int)
language sql security definer stable set search_path = public as $$
  select e.id,
         (select count(*)::int from crew_posts c where c.event_id = e.id),
         (select count(*)::int from rides r where r.event_id = e.id)
  from events e
  where e.status = 'published' and coalesce(e.ends_at, e.starts_at) > now() - interval '12 hours'
    and (exists (select 1 from crew_posts c where c.event_id = e.id) or exists (select 1 from rides r where r.event_id = e.id));
$$;
revoke all on function public.crew_counts() from public;
grant execute on function public.crew_counts() to anon, authenticated;
