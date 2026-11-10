-- Tools used on 10 Nov 2026 to give every club an exact address and position.
-- 1. Overpass API (OpenStreetMap): all amenity=nightclub / music_venue in Germany -> private.osm_places
-- 2. Name + distance matching against venues, every match reviewed by hand (wrong ones rejected)
-- 3. Remaining clubs: address from the club's own pages / guides, position via Nominatim (1 request per second)
-- Data © OpenStreetMap contributors, ODbL.
create extension if not exists http with schema extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists unaccent with schema extensions;
create table if not exists private.osm_places (
  osm_type text, osm_id bigint, name text, tags jsonb, lat double precision, lon double precision,
  primary key (osm_type, osm_id)
);
create table if not exists private.geo_results (vid int, kind text, query text, status int, body jsonb, at timestamptz default now());
create or replace function private.norm(t text) returns text language sql immutable as $$
  select regexp_replace(lower(extensions.unaccent(coalesce(t,''))), '[^a-z0-9]', '', 'g') $$;
revoke all on private.osm_places, private.geo_results from anon, authenticated;
