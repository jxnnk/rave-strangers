-- 008: follow clubs, ticket info on events, community ticket board (secondary market with scam protection)

-- Follow clubs (following people/artists uses the existing "follows" table)
create table if not exists venue_follows (
  profile_id uuid not null references profiles(id) on delete cascade default auth.uid(),
  venue_id   bigint not null references venues(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, venue_id));
alter table venue_follows enable row level security;
create policy vf_all on venue_follows for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Ticket info, maintained by whoever may edit the event (creator, club team, admin)
alter table events add column if not exists price_text    text check (length(price_text) <= 40);
alter table events add column if not exists ticket_status text check (ticket_status in ('available','few','sold_out'));
alter table events add column if not exists resale_url    text check (resale_url ~ '^https://');

-- Ticket board: fans offer/look for tickets. Never above the original price.
create table if not exists ticket_offers (
  id          bigint generated always as identity primary key,
  event_id    bigint not null references events(id) on delete cascade,
  profile_id  uuid not null references profiles(id) on delete cascade default auth.uid(),
  kind        text not null check (kind in ('offer','want')),
  qty         int  not null default 1 check (qty between 1 and 4),
  price       numeric(6,2) check (price between 0 and 1000),
  face_price  numeric(6,2) check (face_price between 0 and 1000),
  note        text check (length(note) <= 300),
  status      text not null default 'open' check (status in ('open','done','removed')),
  created_at  timestamptz not null default now(),
  check (kind = 'want' or (price is not null and face_price is not null and price <= face_price)));
create index if not exists ticket_offers_event on ticket_offers(event_id) where status = 'open';
alter table ticket_offers enable row level security;
create policy to_read on ticket_offers for select using (
  auth.uid() is not null and (profile_id = auth.uid() or private.is_admin()
    or (status = 'open' and not private.is_blocked_between(auth.uid(), profile_id))));
create policy to_insert on ticket_offers for insert with check (profile_id = auth.uid() and status = 'open');
create policy to_update on ticket_offers for update using (profile_id = auth.uid() or private.is_admin())
  with check (profile_id = auth.uid() or private.is_admin());

-- Max. 3 open listings per person, against spam
create or replace function private.limit_offers() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from ticket_offers where profile_id = new.profile_id and status = 'open') >= 3 then
    raise exception 'too many open ticket listings';
  end if;
  return new;
end $$;
revoke execute on function private.limit_offers() from public, anon, authenticated;
create trigger ticket_offers_limit before insert on ticket_offers for each row execute function private.limit_offers();
alter function private.norm(text) set search_path = public, extensions;
