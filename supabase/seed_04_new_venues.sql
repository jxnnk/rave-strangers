-- New venues found after the big import (applied in Supabase)
-- Printhouse: new club in a former newspaper printing plant, open since 5 Sep 2026 (temporary use). Source: in-muenchen.de; position: OSM "Druckhaus Dessauerstraße".
insert into venues (name, city, address, lat, lon, approx, kind)
select 'Printhouse', 'München', 'Dessauerstraße 10, 80992 München', 48.1803634, 11.5324467, false, 'club'
where not exists (select 1 from venues where name ilike 'printhouse%');
