-- Rave Strangers: database schema (Supabase / Postgres 15+)
-- Login and passwords are handled by Supabase Auth (table auth.users).
-- Every table has Row Level Security: the rules below decide who may read and write.
-- Run once in the Supabase SQL editor of a fresh project.

create extension if not exists citext;

-- ---------- Types ----------
create type account_role   as enum ('fan', 'artist', 'organiser', 'admin');
create type request_status as enum ('pending', 'approved', 'rejected');
create type event_status   as enum ('pending', 'published', 'cancelled');
create type event_kind     as enum ('club', 'festival', 'open_air');
create type event_origin   as enum ('manual', 'artist', 'organiser', 'feed');

-- ---------- Profiles (one per login) ----------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  handle      citext unique not null check (handle ~ '^[a-z0-9_.]{3,30}$'),
  display_name text not null check (length(display_name) between 1 and 60),
  city        text,
  bio         text check (length(bio) <= 500),
  role        account_role not null default 'fan',
  verified    boolean not null default false,          -- red tick, only set by admins
  socials     jsonb not null default '{}'::jsonb,       -- {"instagram":"@x","soundcloud":"y",...}
  created_at  timestamptz not null default now()
);

-- Create a profile automatically after sign-up.
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, handle, display_name)
  values (new.id,
          'u_' || substr(md5(new.id::text), 1, 16),   -- unique placeholder, user picks a real handle later
          coalesce(new.raw_user_meta_data->>'display_name', 'Raver'));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Users may not change their own role or tick.
create function protect_profile_fields() returns trigger
language plpgsql as $$
begin
  if (new.role is distinct from old.role or new.verified is distinct from old.verified)
     and auth.uid() is not null and not is_admin() then   -- null uid = server / SQL editor
    raise exception 'role and verified can only be changed by admins';
  end if;
  return new;
end $$;

create function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create trigger profiles_protect before update on profiles
  for each row execute function protect_profile_fields();

-- ---------- Artist verification requests ----------
create table artist_verifications (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references profiles(id) on delete cascade,
  artist_name text not null,
  proof_links text[] not null default '{}',  -- e.g. RA page, official Instagram, booking agency
  note        text,
  status      request_status not null default 'pending',
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);
create unique index one_open_verification on artist_verifications(profile_id) where status = 'pending';

-- An admin approves: profile becomes a verified artist.
create function approve_artist(req_id bigint) returns void
language plpgsql security definer set search_path = public as $$
declare pid uuid;
begin
  if not is_admin() then raise exception 'admins only'; end if;
  update artist_verifications set status = 'approved', reviewed_by = auth.uid(), reviewed_at = now()
    where id = req_id and status = 'pending' returning profile_id into pid;
  if pid is null then raise exception 'request not found or already handled'; end if;
  update profiles set role = 'artist', verified = true where id = pid;
end $$;

-- ---------- Venues and organisers ----------
create table venues (
  id          bigint generated always as identity primary key,
  name        text not null,
  city        text not null,
  address     text,
  lat         double precision not null,
  lon         double precision not null,
  approx      boolean not null default false,
  rules       jsonb not null default '{}'::jsonb,  -- {"phone":..,"door":..,"age":..,"access":..,"awareness":..}
  website     text,
  created_at  timestamptz not null default now()
);

create table venue_members (                       -- organiser accounts, approved per club
  venue_id    bigint references venues(id) on delete cascade,
  profile_id  uuid references profiles(id) on delete cascade,
  status      request_status not null default 'pending',
  proof       text,
  created_at  timestamptz not null default now(),
  primary key (venue_id, profile_id)
);

create function manages_venue(v bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from venue_members
                 where venue_id = v and profile_id = auth.uid() and status = 'approved');
$$;

-- ---------- Events ----------
create table events (
  id          bigint generated always as identity primary key,
  venue_id    bigint not null references venues(id),
  title       text not null check (length(title) between 2 and 140),
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  kind        event_kind not null default 'club',
  genres      text[] not null default '{}',
  no_phone    boolean not null default false,
  ticket_url  text,
  source_url  text,
  origin      event_origin not null default 'manual',
  feed_uid    text,                                 -- UID from an imported calendar feed, avoids duplicates
  status      event_status not null default 'pending',
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now(),
  unique (venue_id, feed_uid)
);
create index events_start on events(starts_at) where status = 'published';

create table event_lineup (
  event_id    bigint references events(id) on delete cascade,
  position    int not null,
  name        text not null,                        -- always stored, even without a profile
  artist_id   uuid references profiles(id),         -- linked when the artist has an account
  primary key (event_id, position)
);

-- Verified artists and approved organisers publish directly; everyone else goes to review.
create function set_event_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if is_admin() then return new; end if;
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
create trigger events_status before insert on events
  for each row execute function set_event_status();

-- ---------- Community ----------
create table attendance (event_id bigint references events(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  visible boolean not null default true,              -- user can go privately
  created_at timestamptz not null default now(), primary key (event_id, profile_id));

create table bookmarks (event_id bigint references events(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  remind boolean not null default false,
  primary key (event_id, profile_id));

create table follows (follower uuid references profiles(id) on delete cascade,
  artist uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower, artist), check (follower <> artist));

create table rides (
  id bigint generated always as identity primary key,
  event_id bigint not null references events(id) on delete cascade,
  driver uuid not null references profiles(id) on delete cascade,
  from_city text not null, departs_at timestamptz not null,
  seats int not null check (seats between 1 and 8),
  created_at timestamptz not null default now());

create table ride_requests (ride_id bigint references rides(id) on delete cascade,
  passenger uuid references profiles(id) on delete cascade,
  status request_status not null default 'pending',
  primary key (ride_id, passenger));

create table crew_posts (
  id bigint generated always as identity primary key,
  event_id bigint not null references events(id) on delete cascade,
  author uuid not null references profiles(id) on delete cascade,
  body text not null check (length(body) between 2 and 280),
  created_at timestamptz not null default now());

create table conversations (id bigint generated always as identity primary key,
  created_at timestamptz not null default now());
create table conversation_members (conversation_id bigint references conversations(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade, primary key (conversation_id, profile_id));
create table messages (
  id bigint generated always as identity primary key,
  conversation_id bigint not null references conversations(id) on delete cascade,
  sender uuid not null references profiles(id) on delete cascade,
  body text not null check (length(body) between 1 and 2000),
  created_at timestamptz not null default now());

create table reviews (
  id bigint generated always as identity primary key,
  venue_id bigint not null references venues(id) on delete cascade,
  event_id bigint references events(id) on delete set null,
  author uuid not null references profiles(id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  body text check (length(body) <= 2000),
  created_at timestamptz not null default now(),
  unique (event_id, author));

-- ---------- Safety ----------
create table blocks (blocker uuid references profiles(id) on delete cascade,
  blocked uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked), check (blocker <> blocked));

create table reports (
  id bigint generated always as identity primary key,
  reporter uuid not null references profiles(id) on delete cascade,
  target_profile uuid references profiles(id) on delete cascade,
  target_event bigint references events(id) on delete cascade,
  target_message bigint references messages(id) on delete cascade,
  reason text not null, details text,
  status request_status not null default 'pending',
  created_at timestamptz not null default now(),
  check (num_nonnulls(target_profile, target_event, target_message) = 1));

create function is_blocked_between(a uuid, b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from blocks where (blocker = a and blocked = b) or (blocker = b and blocked = a));
$$;
create function in_conversation(c bigint) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from conversation_members where conversation_id = c and profile_id = auth.uid());
$$;

-- ---------- Calendar feeds (import) ----------
create table venue_feeds (
  id bigint generated always as identity primary key,
  venue_id bigint not null references venues(id) on delete cascade,
  url text not null, last_synced_at timestamptz, last_error text,
  created_by uuid references profiles(id));

-- ================= Row Level Security =================
alter table profiles enable row level security;
alter table artist_verifications enable row level security;
alter table venues enable row level security;
alter table venue_members enable row level security;
alter table events enable row level security;
alter table event_lineup enable row level security;
alter table attendance enable row level security;
alter table bookmarks enable row level security;
alter table follows enable row level security;
alter table rides enable row level security;
alter table ride_requests enable row level security;
alter table crew_posts enable row level security;
alter table conversations enable row level security;
alter table conversation_members enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table blocks enable row level security;
alter table reports enable row level security;
alter table venue_feeds enable row level security;

-- profiles: public read (minus people who blocked you), own write
create policy p_read on profiles for select using (auth.uid() is null or not is_blocked_between(auth.uid(), id));
create policy p_update on profiles for update using (id = auth.uid() or is_admin());

-- verification: own requests, admins see all
create policy v_read on artist_verifications for select using (profile_id = auth.uid() or is_admin());
create policy v_insert on artist_verifications for insert with check (profile_id = auth.uid() and status = 'pending');

-- venues: public read, organisers edit their own club, admins create
create policy ve_read on venues for select using (true);
create policy ve_update on venues for update using (manages_venue(id) or is_admin());
create policy ve_insert on venues for insert with check (is_admin());

create policy vm_read on venue_members for select using (profile_id = auth.uid() or manages_venue(venue_id) or is_admin());
create policy vm_insert on venue_members for insert with check (profile_id = auth.uid() and status = 'pending');
create policy vm_update on venue_members for update using (is_admin());

-- events: published public; own pending visible to author; edits by author, club or admin
create policy e_read on events for select using (status = 'published' or created_by = auth.uid() or manages_venue(venue_id) or is_admin());
create policy e_insert on events for insert with check (auth.uid() is not null);
create policy e_update on events for update using (created_by = auth.uid() or manages_venue(venue_id) or is_admin());
create policy el_read on event_lineup for select using (exists (select 1 from events e where e.id = event_id));
create policy el_write on event_lineup for all using (exists (select 1 from events e where e.id = event_id and (e.created_by = auth.uid() or manages_venue(e.venue_id) or is_admin())));

-- attendance: visible ones public to logged-in users, own always
create policy a_read on attendance for select using (profile_id = auth.uid() or (visible and auth.uid() is not null and not is_blocked_between(auth.uid(), profile_id)));
create policy a_write on attendance for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy b_all on bookmarks for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy f_read on follows for select using (true);
create policy f_write on follows for all using (follower = auth.uid()) with check (follower = auth.uid());

create policy r_read on rides for select using (auth.uid() is not null and not is_blocked_between(auth.uid(), driver));
create policy r_write on rides for all using (driver = auth.uid()) with check (driver = auth.uid());
create policy rr_read on ride_requests for select using (passenger = auth.uid() or exists (select 1 from rides r where r.id = ride_id and r.driver = auth.uid()));
create policy rr_insert on ride_requests for insert with check (passenger = auth.uid() and status = 'pending');
create policy rr_update on ride_requests for update using (exists (select 1 from rides r where r.id = ride_id and r.driver = auth.uid()));

create policy c_read on crew_posts for select using (auth.uid() is not null and not is_blocked_between(auth.uid(), author));
create policy c_write on crew_posts for all using (author = auth.uid()) with check (author = auth.uid());

-- chat: only members read and write; blocked people cannot message each other
create policy cv_read on conversations for select using (in_conversation(id));
create policy cm_read on conversation_members for select using (in_conversation(conversation_id));
create policy m_read on messages for select using (in_conversation(conversation_id));
create policy m_insert on messages for insert with check (
  sender = auth.uid() and in_conversation(conversation_id)
  and not exists (select 1 from conversation_members cm
                  where cm.conversation_id = messages.conversation_id
                    and cm.profile_id <> auth.uid() and is_blocked_between(auth.uid(), cm.profile_id)));

-- Start a 1:1 chat safely (creates conversation and both memberships).
create function start_chat(other uuid) returns bigint
language plpgsql security definer set search_path = public as $$
declare cid bigint;
begin
  if auth.uid() is null or other = auth.uid() then raise exception 'invalid'; end if;
  if is_blocked_between(auth.uid(), other) then raise exception 'blocked'; end if;
  select a.conversation_id into cid from conversation_members a
    join conversation_members b on a.conversation_id = b.conversation_id
    where a.profile_id = auth.uid() and b.profile_id = other limit 1;
  if cid is not null then return cid; end if;
  insert into conversations default values returning id into cid;
  insert into conversation_members values (cid, auth.uid()), (cid, other);
  return cid;
end $$;

-- reviews: public read; only after the event and only if you marked it as attended
create policy rv_read on reviews for select using (true);
create policy rv_insert on reviews for insert with check (
  author = auth.uid() and (event_id is null or exists (
    select 1 from events e join attendance a on a.event_id = e.id and a.profile_id = auth.uid()
    where e.id = event_id and e.starts_at < now())));
create policy rv_update on reviews for update using (author = auth.uid());
create policy rv_delete on reviews for delete using (author = auth.uid() or is_admin());

-- safety: blocks private to blocker; reports write-only for users, admins read
create policy bl_all on blocks for all using (blocker = auth.uid()) with check (blocker = auth.uid());
create policy rp_insert on reports for insert with check (reporter = auth.uid());
create policy rp_read on reports for select using (is_admin());
create policy rp_update on reports for update using (is_admin());

create policy fd_all on venue_feeds for all using (manages_venue(venue_id) or is_admin()) with check (manages_venue(venue_id) or is_admin());
