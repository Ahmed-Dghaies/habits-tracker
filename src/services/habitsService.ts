import { requireSupabase } from "@/lib/supabase"

import type { Habit, HabitCompletion, HabitWithCompletions, NewHabitInput } from "@/types"

/**
 * Data-access layer for habits. All Supabase queries live here so components
 * and hooks stay free of persistence details.
 */

export async function fetchHabitsWithCompletions(userId: string): Promise<HabitWithCompletions[]> {
  const supabase = requireSupabase()
  const [{ data: habits, error: habitsError }, { data: completions, error: completionsError }] = await Promise.all([
    supabase.from("habits").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    supabase.from("habit_completions").select("*").eq("user_id", userId),
  ])

  if (habitsError) throw habitsError
  if (completionsError) throw completionsError

  const byHabit = new Map<string, Set<string>>()
  for (const c of (completions ?? []) as HabitCompletion[]) {
    if (!byHabit.has(c.habit_id)) byHabit.set(c.habit_id, new Set())
    byHabit.get(c.habit_id)!.add(c.completed_date)
  }

  return ((habits ?? []) as Habit[]).map((habit) => ({
    ...habit,
    completedDates: byHabit.get(habit.id) ?? new Set<string>(),
  }))
}

export async function createHabit(input: NewHabitInput, userId: string): Promise<Habit> {
  const supabase = requireSupabase()
  const { data, error } = await supabase
    .from("habits")
    .insert({ user_id: userId, name: input.name, icon: input.icon, color: input.color })
    .select()
    .single()

  if (error) throw error
  return data as Habit
}

export async function deleteHabit(habitId: string, userId: string): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase.from("habits").delete().eq("id", habitId).eq("user_id", userId)
  if (error) throw error
}

export async function markCompleted(habitId: string, dateKey: string, userId: string): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from("habit_completions")
    .insert({ user_id: userId, habit_id: habitId, completed_date: dateKey })
  // Ignore unique-violation (already completed for the day).
  if (error && error.code !== "23505") throw error
}

export async function unmarkCompleted(habitId: string, dateKey: string, userId: string): Promise<void> {
  const supabase = requireSupabase()
  const { error } = await supabase
    .from("habit_completions")
    .delete()
    .eq("habit_id", habitId)
    .eq("completed_date", dateKey)
    .eq("user_id", userId)
  if (error) throw error
}
