-- Admins can approve or reject artist verification requests and see them with the profile.
create policy v_update on artist_verifications for update using (private.is_admin());
