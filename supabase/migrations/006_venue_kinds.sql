-- Permanent clubs vs. places that only matter around their events.
alter table venues add column if not exists kind text not null default 'club'
  check (kind in ('club','seasonal','event_site'));
comment on column venues.kind is 'club: permanent club, always on the map; seasonal: open-air club, shown only when events are coming up; event_site: festival ground, fair or arena, shown only around its events';
update venues set kind='event_site' where id in (18,20,24);  -- Airport Club, dm-arena, Landesmesse (Stutyard)
update venues set kind='seasonal'   where id in (81,105);    -- OURS, Kiesgrube
