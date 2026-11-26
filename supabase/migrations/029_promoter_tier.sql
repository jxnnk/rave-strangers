-- 029: Account tiers.
--   Raver    = every account, free. Can see events, crews, chats ... but not add events.
--   Promoter = paid subscription. Can add events that everyone sees.
-- The first event of a promoter is reviewed by an admin, after that their events go live right away.
-- Payment comes later: until then a raver sends a request and an admin activates the subscription
-- by hand (approve_promoter / set_promoter_until), e.g. after an invoice is paid.
-- Admins and the server (imports, auth.uid() is null) can still add events as before.

-- ---------- Tables ----------
create table if not exists public.promoters (
  profile_id   uuid primary key references public.profiles(id) on delete cascade,
  org_name     text check (org_name is null or char_length(org_name) between 1 and 80),
  active_until timestamptz not null,
  updated_at   timestamptz not null default now()
);

create table if not exists public.promoter_requests (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  org_name    text not null check (char_length(org_name) between 1 and 80),
  website     text check (website is null or char_length(website) <= 300),
  note        text check (note is null or char_length(note) <= 1000),
  status      request_status not null default 'pending',
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);
create unique index if not exists one_open_promoter_request
  on public.promoter_requests(profile_id) where status = 'pending';

alter table public.promoters enable row level security;
alter table public.promoter_requests enable row level security;

-- Own row or admin may read. Only admins (via the functions below) write subscriptions.
create policy pr_read on public.promoters for select to authenticated
  using (profile_id = auth.uid() or private.is_admin());
create policy pr_admin on public.promoters for all to authenticated
  using (private.is_admin()) with check (private.is_admin());

create policy preq_read on public.promoter_requests for select to authenticated
  using (profile_id = auth.uid() or private.is_admin());
create policy preq_insert on public.promoter_requests for insert to authenticated
  with check (profile_id = auth.uid() and status = 'pending' and reviewed_by is null and reviewed_at is null);
create policy preq_admin on public.promoter_requests for update to authenticated
  using (private.is_admin()) with check (private.is_admin());

revoke all on public.promoters, public.promoter_requests from anon;

-- ---------- Helpers ----------
create or replace function private.is_promoter(uid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path = public, private as $$
  select exists (select 1 from promoters where profile_id = uid and active_until > now());
$$;
revoke all on function private.is_promoter(uuid) from public;
grant execute on function private.is_promoter(uuid) to authenticated;

-- ---------- New events: promoters only ----------
create or replace function private.set_event_status() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if auth.uid() is null or private.is_admin() then return new; end if;   -- server imports, admins
  if not private.is_promoter(auth.uid()) then
    raise exception 'promoter_required' using errcode = '42501',
      hint = 'Adding events needs a Promoter account.';
  end if;
  -- First event of a promoter is reviewed; once one was published, the next ones go live directly.
  if exists (select 1 from events where created_by = auth.uid() and status = 'published') then
    new.status := 'published';
  else
    new.status := 'pending';
  end if;
  new.origin := case when new.origin = 'feed' then 'feed'::event_origin else 'organiser'::event_origin end;
  new.created_by := auth.uid();
  return new;
end $$;
revoke all on function private.set_event_status() from public, anon, authenticated;

-- Edits: trusted promoters (active + one event already published) may publish their own events;
-- everyone else keeps the status (only cancelling is allowed). Nobody changes creator / origin.
create or replace function private.guard_event_update() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if auth.uid() is null or private.is_admin() then return new; end if;
  if private.is_promoter(auth.uid())
     and exists (select 1 from events where created_by = auth.uid() and status = 'published') then
    new.created_by := old.created_by; new.origin := old.origin; return new;
  end if;
  new.status := case when new.status = 'cancelled' then 'cancelled'::event_status else old.status end;
  new.created_by := old.created_by;
  new.origin := old.origin;
  new.venue_id := old.venue_id;
  return new;
end $$;
revoke all on function private.guard_event_update() from public, anon, authenticated;

-- ---------- Functions for the apps ----------
-- My tier: 'admin' | 'promoter' | 'raver', plus end of the subscription and an open request, if any.
create or replace function public.my_tier()
returns table(tier text, active_until timestamptz, org_name text, request_status text, trusted boolean)
language sql stable security definer set search_path = public, private as $$
  select case when private.is_admin() then 'admin'
              when private.is_promoter(auth.uid()) then 'promoter'
              else 'raver' end,
         (select p.active_until from promoters p where p.profile_id = auth.uid()),
         (select p.org_name from promoters p where p.profile_id = auth.uid()),
         (select r.status::text from promoter_requests r where r.profile_id = auth.uid()
           order by r.created_at desc limit 1),
         exists (select 1 from events e where e.created_by = auth.uid() and e.status = 'published')
  where auth.uid() is not null;
$$;
revoke all on function public.my_tier() from public, anon;
grant execute on function public.my_tier() to authenticated;

-- Admin: approve a request and activate (or extend) the subscription by N months.
create or replace function public.approve_promoter(req_id bigint, p_months int default 1) returns void
language plpgsql security definer set search_path = public, private as $$
declare pid uuid; org text;
begin
  if not private.is_admin() then raise exception 'admins only'; end if;
  if p_months is null or p_months not between 1 and 24 then raise exception 'months must be 1..24'; end if;
  update promoter_requests set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
    where id = req_id and status = 'pending' returning profile_id, org_name into pid, org;
  if pid is null then raise exception 'request not found or already handled'; end if;
  insert into promoters(profile_id, org_name, active_until)
    values (pid, org, now() + make_interval(months => p_months))
  on conflict (profile_id) do update
    set active_until = greatest(promoters.active_until, now()) + make_interval(months => p_months),
        org_name = excluded.org_name, updated_at = now();
end $$;

create or replace function public.reject_promoter(req_id bigint) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  if not private.is_admin() then raise exception 'admins only'; end if;
  update promoter_requests set status = 'rejected', reviewed_by = auth.uid(), reviewed_at = now()
    where id = req_id and status = 'pending';
end $$;

-- Admin: extend by N months (p_months > 0) or end now (p_months = 0) an existing subscription.
create or replace function public.set_promoter_until(p_profile uuid, p_months int) returns timestamptz
language plpgsql security definer set search_path = public, private as $$
declare until timestamptz;
begin
  if not private.is_admin() then raise exception 'admins only'; end if;
  if p_months is null or p_months not between 0 and 24 then raise exception 'months must be 0..24'; end if;
  update promoters set
    active_until = case when p_months = 0 then now()
                        else greatest(active_until, now()) + make_interval(months => p_months) end,
    updated_at = now()
  where profile_id = p_profile returning active_until into until;
  if until is null then raise exception 'not a promoter'; end if;
  return until;
end $$;

revoke all on function public.approve_promoter(bigint, int), public.reject_promoter(bigint),
  public.set_promoter_until(uuid, int) from public, anon;
grant execute on function public.approve_promoter(bigint, int), public.reject_promoter(bigint),
  public.set_promoter_until(uuid, int) to authenticated;
