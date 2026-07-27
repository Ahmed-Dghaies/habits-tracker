export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  created_at: string
}

export interface HabitCompletion {
  id: string
  habit_id: string
  completed_date: string // YYYY-MM-DD
  created_at: string
}

/** A habit joined with the set of dates on which it was completed. */
export interface HabitWithCompletions extends Habit {
  completedDates: Set<string>
}

export interface NewHabitInput {
  name: string
  icon: string
  color: string
}
