
function isAuthClockSkewError(err: unknown) {
  if (!(err instanceof Error)) return false;
  return err.message.includes("JWT issued at future") || err.message.includes("PGRST303");
}
import { useCallback, useEffect, useState } from "react";

import {
  createHabit,
  deleteHabit,
  fetchHabitsWithCompletions,
  markCompleted,
  unmarkCompleted,
} from "@/services/habitsService";
import { todayKey } from "@/utils/dates";

import type { HabitWithCompletions, NewHabitInput } from "@/types";

interface UseHabitsResult {
  habits: HabitWithCompletions[];
  loading: boolean;
  error: string | null;
  addHabit: (input: NewHabitInput) => Promise<boolean>;
  removeHabit: (habitId: string) => Promise<void>;
  toggleToday: (habitId: string) => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Central state + actions for habits. Uses optimistic updates so the UI feels
 * instant, then reconciles with Supabase.
 */
export function useHabits(userId: string): UseHabitsResult {
  const [habits, setHabits] = useState<HabitWithCompletions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const reload = useCallback(async function reloadAttempt(retryCount = 0) {
    try {
      setError(null);
      const data = await fetchHabitsWithCompletions(userId);
      setHabits(data);
    } catch (err) {
      console.error("Failed to load habits:", err);
      if (isAuthClockSkewError(err) && retryCount < 1) {
        window.setTimeout(() => {
          void reloadAttempt(retryCount + 1);
        }, 1500);
        return;
      }

      setError(
        isAuthClockSkewError(err)
          ? "Supabase authentication is not ready yet. Refresh the page or sign out and back in."
          : "Could not load habits. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [reload]);

  const addHabit = useCallback(async (input: NewHabitInput) => {
    try {
      setError(null);
      const created = await createHabit(input, userId);
      setHabits((prev) => [...prev, { ...created, completedDates: new Set<string>() }]);
      return true;
    } catch (err) {
      console.error("Failed to create habit:", err);
      setError("Could not create habit. Please check your Supabase configuration.");
      return false;
    }
  }, [userId]);

  const removeHabit = useCallback(
    async (habitId: string) => {
      const habitToRestore = habits.find((habit) => habit.id === habitId);
      const originalIndex = habits.findIndex((habit) => habit.id === habitId);
      setError(null);
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      try {
        await deleteHabit(habitId, userId);
      } catch (err) {
        console.error("Failed to delete habit:", err);
        if (habitToRestore && originalIndex >= 0) {
          setHabits((prev) => {
            const next = [...prev];
            next.splice(originalIndex, 0, habitToRestore);
            return next;
          });
        }
        setError("Could not delete habit. Please check your Supabase configuration.");
      }
    },
      [habits, userId],
  );

  const toggleToday = useCallback(
    async (habitId: string) => {
      const key = todayKey();
      const habit = habits.find((h) => h.id === habitId);
      if (!habit) return;
      const isDone = habit.completedDates.has(key);
      setError(null);

      // Optimistic update.
      setHabits((prev) =>
        prev.map((h) => {
          if (h.id !== habitId) return h;
          const next = new Set(h.completedDates);
          if (isDone) next.delete(key);
          else next.add(key);
          return { ...h, completedDates: next };
        }),
      );

      try {
        if (isDone) await unmarkCompleted(habitId, key, userId);
        else await markCompleted(habitId, key, userId);
      } catch (err) {
        console.error("Failed to toggle completion:", err);
        // Revert on failure.
        setHabits((prev) =>
          prev.map((h) => {
            if (h.id !== habitId) return h;
            const next = new Set(h.completedDates);
            if (isDone) next.add(key);
            else next.delete(key);
            return { ...h, completedDates: next };
          }),
        );
        setError("Could not update habit completion. Please check your Supabase configuration.");
        return;
      }

      setError(null);
    },
    [habits, userId],
  );

  return { habits, loading, error, addHabit, removeHabit, toggleToday, reload };
}
