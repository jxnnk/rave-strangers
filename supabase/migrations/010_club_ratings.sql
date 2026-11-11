-- 010: club ratings (overall + optional categories), one review per person and club
alter table reviews add column if not exists sound  int check (sound  between 1 and 5);
alter table reviews add column if not exists crowd  int check (crowd  between 1 and 5);
alter table reviews add column if not exists door   int check (door   between 1 and 5);
alter table reviews add column if not exists safety int check (safety between 1 and 5);
alter table reviews add column if not exists updated_at timestamptz;
create unique index if not exists reviews_one_per_venue on reviews (venue_id, author) where event_id is null;

create or replace view venue_ratings with (security_invoker = true) as
  select venue_id, round(avg(stars), 1) as avg, count(*)::int as n,
         round(avg(sound), 1) as sound, round(avg(crowd), 1) as crowd,
         round(avg(door), 1) as door, round(avg(safety), 1) as safety
  from reviews group by venue_id;
grant select on venue_ratings to anon, authenticated;
