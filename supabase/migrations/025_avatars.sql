-- 025: Profilbilder
-- Bucket "avatars" (öffentlich lesbar, max. 2 MB, nur JPEG/PNG/WebP).
-- Jeder darf nur in seinen eigenen Ordner <user-id>/ schreiben.
-- profiles.avatar_url darf nur auf das eigene Bild im eigenen Ordner zeigen.

alter table public.profiles add column if not exists avatar_url text;

alter table public.profiles add constraint profiles_avatar_url_own check (
  avatar_url is null
  or avatar_url like 'https://wnmxloykrnbrpvzxhnsb.supabase.co/storage/v1/object/public/avatars/' || id::text || '/%'
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy avatars_own_select on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_own_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_own_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy avatars_own_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
