-- Enforce non-null user_id values after the auth migration has been applied.
-- If legacy rows still have null user_id values, fix them before running this.

do $$
begin
  if exists (select 1 from public.habits where user_id is null)
     or exists (select 1 from public.habit_completions where user_id is null) then
    raise exception 'Cannot enforce NOT NULL while habits or habit_completions still contain null user_id values';
  end if;
end $$;

alter table public.habits
  alter column user_id set not null;

alter table public.habit_completions
  alter column user_id set not null;