-- Remove legacy auth column now that the app uses public access only.
alter table public.habits
  drop column if exists user_id;
