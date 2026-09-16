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

/**
 * Weighted completion score over the last 14 days.
 *
 * Recent days count more heavily: today = 1.0, yesterday = 0.9, ..., 9 days ago = 0.1,
 * and older days beyond 10 days ago contribute 0.
 */
export function momentum(completedDates: Set<string>): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let possibleWeight = 0
  let completedWeight = 0

  for (let offset = 0; offset < 14; offset++) {
    const date = addDays(today, -offset)
    const dateKey = toDateKey(date)
    const weight = offset < 10 ? Number((1 - offset * 0.1).toFixed(1)) : 0

    possibleWeight += weight
    if (completedDates.has(dateKey)) {
      completedWeight += weight
    }
  }

  if (possibleWeight === 0) return 0
  return (completedWeight / possibleWeight) * 100
}
