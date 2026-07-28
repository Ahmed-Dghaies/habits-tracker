-- Existing databases: add user_id columns and user-scoped policies.
-- Existing public rows will need to be reassigned manually before the new
-- policies will expose them to authenticated users.

alter table public.habits
  add column if not exists user_id uuid;

alter table public.habit_completions
  add column if not exists user_id uuid;

alter table public.habits
  alter column user_id set default auth.uid();

alter table public.habit_completions
  alter column user_id set default auth.uid();

create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habit_completions_user_id_idx on public.habit_completions(user_id);

alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

drop policy if exists "user habits access" on public.habits;
create policy "user habits access" on public.habits
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user completions access" on public.habit_completions;
create policy "user completions access" on public.habit_completions
  for all
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.habits
      where habits.id = habit_completions.habit_id
        and habits.user_id = auth.uid()
    )
  );