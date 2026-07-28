-- Habit Tracker schema
-- Tables: habits, habit_completions
-- Initial public schema. Auth and user-scoped access are applied via a
-- separate migration so the base schema stays stable.

create extension if not exists "pgcrypto";

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
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
