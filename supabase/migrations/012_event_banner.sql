-- Banner image (official flyer/logo from the organiser) shown behind the event page.
-- We store only a link plus the credit; the image stays on the organiser's server.
alter table public.events add column if not exists image_url text, add column if not exists image_credit text;
alter table public.events drop constraint if exists events_image_url_https;
alter table public.events add constraint events_image_url_https check (image_url is null or image_url ~* '^https://');
