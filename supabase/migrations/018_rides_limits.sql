create unique index if not exists rides_one_per_event on public.rides(event_id, driver);
create index if not exists rides_event on public.rides(event_id, departs_at);
alter table public.rides add column if not exists note text check (note is null or length(note) <= 200);
alter table public.rides drop constraint if exists rides_from_city_len;
alter table public.rides add constraint rides_from_city_len check (length(from_city) between 2 and 60);
