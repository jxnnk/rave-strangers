-- Signed-in-only RPCs: make sure the anon role cannot call them (they check auth anyway).
revoke execute on function public.admin_ref_stats(int) from anon;
revoke execute on function public.delete_my_account() from anon;
revoke execute on function public.my_chats() from anon;
revoke execute on function public.start_chat(uuid) from anon;
revoke execute on function public.approve_artist(bigint) from anon;
