-- Review agent: every feed event gets checked by a second, independent agent.
-- review_state: ok (confirmed) | unclear (needs a human) | rejected (refuted; status set to cancelled)
alter table public.events
  add column if not exists review_state text,
  add column if not exists review_note text,
  add column if not exists reviewed_at timestamptz;
alter table public.events drop constraint if exists events_review_state_check;
alter table public.events add constraint events_review_state_check check (review_state is null or review_state in ('ok','unclear','rejected'));
alter table public.events drop constraint if exists events_review_note_len;
alter table public.events add constraint events_review_note_len check (review_note is null or length(review_note) <= 600);

-- Only the server (review agent) and admins may set review fields.
create or replace function private.guard_event_review() returns trigger
language plpgsql security definer set search_path = public, private as $$
begin
  if auth.uid() is null or private.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.review_state := null; new.review_note := null; new.reviewed_at := null;
  else
    new.review_state := old.review_state; new.review_note := old.review_note; new.reviewed_at := old.reviewed_at;
  end if;
  return new;
end $$;
revoke all on function private.guard_event_review() from public, anon, authenticated;
drop trigger if exists events_review_guard on public.events;
create trigger events_review_guard before insert or update on public.events
  for each row execute function private.guard_event_review();

create index if not exists events_review_idx on public.events (review_state) where review_state is not null;
