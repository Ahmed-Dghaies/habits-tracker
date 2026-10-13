import { useCallback } from "react";

import {
  useAddHabitMutation,
  useDeleteHabitMutation,
  useGetHabitsQuery,
  useSetCompletionMutation,
} from "@/lib/habitsApi";
import { todayKey } from "@/utils/dates";

import type { NewHabitInput } from "@/types";

interface ActionState {
  isLoading: boolean;
  isError: boolean;
}

export interface HabitAction<Arguments extends object, Result> extends ActionState {
  handler: (args: Arguments) => Promise<Result>;
}

export interface HabitActionWithoutArguments<Result> extends ActionState {
  handler: () => Promise<Result>;
}

export interface AddHabitArguments {
  input: NewHabitInput;
}

export interface HabitIdArguments {
  habitId: string;
}

export interface CompletionDateArguments {
  dateKey: string;
}

export interface LogCompletionArguments extends HabitIdArguments, CompletionDateArguments {}

export function useHabits(userId: string) {
  const {
    data: habits = [],
    isLoading: isLoadingHabits,
    isError: isGetHabitsError,
    refetch: refetchHabits,
  } = useGetHabitsQuery(userId);
  const [triggerAddHabit, { isLoading: isAddingHabit, isError: isAddHabitError }] =
    useAddHabitMutation();
  const [triggerDeleteHabit, { isLoading: isRemovingHabit, isError: isRemoveHabitError }] =
    useDeleteHabitMutation();
  const [triggerLogCompletion, { isLoading: isLoggingCompletion, isError: isLogCompletionError }] =
    useSetCompletionMutation();
  const [triggerToggleToday, { isLoading: isTogglingToday, isError: isToggleTodayError }] =
    useSetCompletionMutation();

  const handleAddHabit = useCallback(
    async ({ input }: AddHabitArguments): Promise<boolean> => {
      try {
        await triggerAddHabit({ input, userId }).unwrap();
        return true;
      } catch {
        return false;
      }
    },
    [triggerAddHabit, userId],
  );

  const handleRemoveHabit = useCallback(
    async ({ habitId }: HabitIdArguments): Promise<boolean> => {
      try {
        await triggerDeleteHabit({ habitId, userId }).unwrap();
        return true;
      } catch {
        return false;
      }
    },
    [triggerDeleteHabit, userId],
  );

  const handleLogCompletion = useCallback(
    async ({ habitId, dateKey }: LogCompletionArguments): Promise<boolean> => {
      try {
        await triggerLogCompletion({ habitId, userId, dateKey, completed: true }).unwrap();
        return true;
      } catch {
        return false;
      }
    },
    [triggerLogCompletion, userId],
  );

  const handleToggleToday = useCallback(
    async ({ habitId }: HabitIdArguments): Promise<void> => {
      const dateKey = todayKey();
      const habit = habits.find((item) => item.id === habitId);
      if (!habit) return;

      try {
        await triggerToggleToday({
          habitId,
          userId,
          dateKey,
          completed: !habit.completedDates.includes(dateKey),
        }).unwrap();
      } catch {
        // The mutation error is exposed through the hook result.
      }
    },
    [habits, triggerToggleToday, userId],
  );

  const refetchHabitsHandler = useCallback(async () => {
    try {
      await refetchHabits().unwrap();
    } catch {
      // The mutation error is exposed through the hook result.
    }
  }, [refetchHabits]);

  return {
    getHabits: {
      data: habits,
      isLoading: isLoadingHabits,
      isError: isGetHabitsError,
      refetch: refetchHabitsHandler,
    },
    addHabit: {
      handler: handleAddHabit,
      isLoading: isAddingHabit,
      isError: isAddHabitError,
    },
    removeHabit: {
      handler: handleRemoveHabit,
      isLoading: isRemovingHabit,
      isError: isRemoveHabitError,
    },
    logCompletion: {
      handler: handleLogCompletion,
      isLoading: isLoggingCompletion,
      isError: isLogCompletionError,
    },
    toggleToday: {
      handler: handleToggleToday,
      isLoading: isTogglingToday,
      isError: isToggleTodayError,
    },
  };
}
