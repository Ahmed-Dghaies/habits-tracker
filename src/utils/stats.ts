import { addDays, toDateKey } from "@/utils/dates"

/** Current consecutive-day streak ending today (or yesterday). */
export function currentStreak(completedDates: Set<string>): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Allow the streak to count from today or, if today isn't done yet, yesterday.
  let cursor = completedDates.has(toDateKey(today)) ? today : addDays(today, -1)
  let streak = 0
  while (completedDates.has(toDateKey(cursor))) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}
