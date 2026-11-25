-- 024: Organizers (labels, collectives, event series like 44 Label, UNREAL, Teletech):
-- searchable, own page with upcoming events, follow -> notification on new dates.

create table if not exists public.organizers (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 1 and 80),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,60}$'),
  kind text not null default 'series' check (kind in ('label', 'collective', 'series', 'promoter', 'festival')),
  aliases text[] not null default '{}',   -- lowercase words matched in event titles
  website text check (website is null or website ~ '^https://'),
  created_at timestamptz not null default now()
);
create table if not exists public.event_organizers (
  event_id bigint not null references public.events(id) on delete cascade,
  organizer_id bigint not null references public.organizers(id) on delete cascade,
  primary key (event_id, organizer_id)
);
create index if not exists event_organizers_org_idx on public.event_organizers(organizer_id);
create table if not exists public.organizer_follows (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  organizer_id bigint not null references public.organizers(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, organizer_id)
);

alter table public.organizers enable row level security;
alter table public.event_organizers enable row level security;
alter table public.organizer_follows enable row level security;
create policy org_read on public.organizers for select using (true);
create policy org_admin on public.organizers for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy eo_read on public.event_organizers for select using (true);
create policy eo_admin on public.event_organizers for all to authenticated using (private.is_admin()) with check (private.is_admin());
create policy of_all on public.organizer_follows for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
revoke insert, update, delete on public.organizers, public.event_organizers from anon;
revoke all on public.organizer_follows from anon;

alter table public.notifications add column if not exists organizer_id bigint references public.organizers(id) on delete cascade;

-- Link events to organizers by the names in their titles (word boundaries, case-insensitive).
create or replace function private.match_event_organizers(p_event bigint default null) returns int
language plpgsql security definer set search_path = public, private as $$
declare n int;
begin
  insert into event_organizers(event_id, organizer_id)
  select e.id, o.id
  from events e
  join organizers o on exists (
    select 1 from unnest(o.aliases) a
    where lower(e.title) ~ ('(^|[^a-z0-9äöü])' || a || '([^a-z0-9äöü]|$)'))
  where (p_event is null and e.starts_at > now() - interval '1 day') or e.id = p_event
  on conflict do nothing;
  get diagnostics n = row_count;
  return n;
end $$;

create or replace function private.events_match_org() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.match_event_organizers(new.id);
  return new;
end $$;
create or replace trigger events_match_org after insert or update of title on public.events
  for each row execute function private.events_match_org();

-- New date of a followed organizer -> notification (max one per organizer and person every 12 h).
create or replace function private.notify_org_event() returns trigger
language plpgsql security definer set search_path = public, private as $$
declare ev record;
begin
  select id, venue_id, status, starts_at into ev from events where id = new.event_id;
  if ev.status <> 'published' or ev.starts_at < now() then return new; end if;
  insert into notifications (profile_id, kind, event_id, venue_id, organizer_id)
  select f.profile_id, 'new_event', ev.id, ev.venue_id, new.organizer_id
  from organizer_follows f
  where f.organizer_id = new.organizer_id
    and private.wants(f.profile_id, 'new_event')
    and not exists (select 1 from notifications n where n.profile_id = f.profile_id
                    and n.organizer_id = new.organizer_id and n.created_at > now() - interval '12 hours');
  return new;
end $$;
create or replace trigger event_organizers_notify after insert on public.event_organizers
  for each row execute function private.notify_org_event();

-- Search organizers with number of upcoming events.
create or replace function public.organizer_list()
returns table(id bigint, name text, slug text, kind text, upcoming int)
language sql stable security definer set search_path = public as $$
  select o.id, o.name, o.slug, o.kind,
         (select count(*)::int from event_organizers eo join events e on e.id = eo.event_id
          where eo.organizer_id = o.id and e.status = 'published' and e.starts_at > now() - interval '12 hours')
  from organizers o order by 5 desc, o.name;
$$;
grant execute on function public.organizer_list() to anon, authenticated;

insert into organizers(name, slug, kind, aliases, website) values
 ('44 Label Group', '44-label', 'label', '{"44 label","44 label group","44 festival"}', null),
 ('UNREAL', 'unreal', 'series', '{"unreal"}', null),
 ('Teletech', 'teletech', 'series', '{"teletech"}', null),
 ('Hyper Dreams', 'hyper-dreams', 'series', '{"hyper dreams"}', null),
 ('Kinky Galore', 'kinky-galore', 'series', '{"kinky galore"}', null),
 ('WE ARE ONE', 'we-are-one', 'collective', '{"we are one"}', null),
 ('Face 2 Face', 'face-2-face', 'series', '{"face 2 face","face2face"}', null),
 ('Groove Ruine', 'groove-ruine', 'collective', '{"groove ruine"}', null),
 ('Extatica', 'extatica', 'series', '{"extatica"}', null),
 ('Stutyard', 'stutyard', 'festival', '{"stutyard"}', null),
 ('KRANICH', 'kranich', 'collective', '{"kranich"}', null),
 ('Verknipt', 'verknipt', 'series', '{"verknipt"}', null),
 ('Awakenings', 'awakenings', 'festival', '{"awakenings"}', null),
 ('Time Warp', 'time-warp', 'festival', '{"time warp"}', null),
 ('KNTXT', 'kntxt', 'label', '{"kntxt"}', null),
 ('EXHALE', 'exhale', 'label', '{"exhale"}', null),
 ('Possession', 'possession', 'series', '{"possession"}', null),
 ('Acid Wars', 'acid-wars', 'series', '{"acid wars"}', null),
 ('Rave on Snow', 'rave-on-snow', 'festival', '{"rave on snow"}', null),
 ('BCCO', 'bcco', 'collective', '{"bcco"}', null)
on conflict (slug) do nothing;

select private.match_event_organizers();
