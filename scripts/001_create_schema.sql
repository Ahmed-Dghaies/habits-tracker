-- Habit Tracker schema
-- Tables: habits, habit_completions
-- Auth-ready: an optional user_id column is included for future authentication,
-- but is nullable so the app works without auth today.

create extension if not exists "pgcrypto";

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  name text not null,
  icon text not null default 'Activity',
  color text not null default '#22c55e',
  created_at timestamptz not null default now()
);

create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  completed_date date not null default current_date,
  created_at timestamptz not null default now(),
  unique (habit_id, completed_date)
);

create index if not exists habit_completions_habit_id_idx on public.habit_completions(habit_id);
create index if not exists habit_completions_date_idx on public.habit_completions(completed_date);

-- Enable Row Level Security (auth-ready). For now, allow public access with the
-- anon key so the app works before authentication is added. When auth is added,
-- these permissive policies can be replaced with user-scoped policies.
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

drop policy if exists "public habits access" on public.habits;
create policy "public habits access" on public.habits
  for all using (true) with check (true);

drop policy if exists "public completions access" on public.habit_completions;
create policy "public completions access" on public.habit_completions
  for all using (true) with check (true);
