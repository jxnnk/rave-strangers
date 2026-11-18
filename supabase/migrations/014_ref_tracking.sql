-- Where do users come from? Anonymous visit counts per source + source at signup.
-- Stored in the private schema (not reachable via the API); only via the functions below.
create table if not exists private.ref_visits (
  id bigserial primary key,
  ref text not null check (ref ~ '^[a-z0-9_-]{1,40}$'),
  event_id bigint,
  created_at timestamptz not null default now()
);
create index if not exists ref_visits_ref_time on private.ref_visits (ref, created_at);
create table if not exists private.signup_refs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ref text not null,
  created_at timestamptz not null default now()
);

create or replace function public.track_ref(p_ref text, p_event bigint default null) returns void
language plpgsql security definer set search_path = public, private as $$
declare r text := lower(left(coalesce(p_ref,''), 40));
begin
  if r !~ '^[a-z0-9_-]{1,40}$' then return; end if;
  if (select count(*) from private.ref_visits where ref = r and created_at > now() - interval '1 day') >= 5000 then return; end if;
  insert into private.ref_visits(ref, event_id) values (r, p_event);
end $$;
revoke all on function public.track_ref(text, bigint) from public;
grant execute on function public.track_ref(text, bigint) to anon, authenticated;

create or replace function public.admin_ref_stats(p_days int default 30)
returns table(ref text, visits bigint, signups bigint)
language plpgsql security definer set search_path = public, private as $$
begin
  if not private.is_admin() then raise exception 'not allowed'; end if;
  return query
  with v as (select rv.ref, count(*) n from private.ref_visits rv where rv.created_at > now() - make_interval(days => p_days) group by rv.ref),
       s as (select sr.ref, count(*) n from private.signup_refs sr where sr.created_at > now() - make_interval(days => p_days) group by sr.ref)
  select coalesce(v.ref, s.ref), coalesce(v.n, 0), coalesce(s.n, 0)
  from v full join s on s.ref = v.ref
  order by coalesce(s.n,0) desc, coalesce(v.n,0) desc;
end $$;
revoke all on function public.admin_ref_stats(int) from public;
grant execute on function public.admin_ref_stats(int) to authenticated;

create or replace function private.handle_new_user() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare r text := lower(left(coalesce(new.raw_user_meta_data->>'ref',''), 40));
begin
  insert into profiles (id, handle, display_name)
  values (new.id, 'u_' || substr(md5(new.id::text), 1, 16), coalesce(new.raw_user_meta_data->>'display_name', 'Raver'));
  if r ~ '^[a-z0-9_-]{1,40}$' then
    insert into private.signup_refs(user_id, ref) values (new.id, r) on conflict do nothing;
  end if;
  return new;
end $$;
