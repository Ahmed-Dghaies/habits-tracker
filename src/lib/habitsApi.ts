import { createApi, fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";

import { requireSupabase } from "@/lib/supabase";

import type { Habit, HabitCompletion, HabitWithCompletions, NewHabitInput } from "@/types";

interface HabitMutationArgs {
  habitId: string;
  userId: string;
}

interface SetCompletionArgs extends HabitMutationArgs {
  dateKey: string;
  completed: boolean;
}

function handleSupabaseError(error: unknown): { error: FetchBaseQueryError } {
  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String(error.message)
      : "Unknown Supabase error";

  return { error: { status: "CUSTOM_ERROR", error: message } };
}

function isAuthClockSkewError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;

  const { code, message } = error as { code?: unknown; message?: unknown };
  return code === "PGRST303" || message === "JWT issued at future";
}

async function fetchHabits(userId: string): Promise<HabitWithCompletions[]> {
  const supabase = requireSupabase();
  const [{ data: habits, error: habitsError }, { data: completions, error: completionsError }] =
    await Promise.all([
      supabase
        .from("habits")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      supabase.from("habit_completions").select("*").eq("user_id", userId),
    ]);

  if (habitsError) throw habitsError;
  if (completionsError) throw completionsError;

  const datesByHabit = new Map<string, string[]>();
  for (const completion of (completions ?? []) as HabitCompletion[]) {
    const dates = datesByHabit.get(completion.habit_id) ?? [];
    dates.push(completion.completed_date);
    datesByHabit.set(completion.habit_id, dates);
  }

  return ((habits ?? []) as Habit[]).map((habit) => ({
    ...habit,
    completedDates: datesByHabit.get(habit.id) ?? [],
  }));
}

export const habitsApi = createApi({
  reducerPath: "habitsApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/" }),
  tagTypes: ["Habit"],
  endpoints: (builder) => ({
    getHabits: builder.query<HabitWithCompletions[], string>({
      queryFn: async (userId) => {
        try {
          try {
            return { data: await fetchHabits(userId) };
          } catch (error) {
            if (!isAuthClockSkewError(error)) throw error;

            const { error: refreshError } = await requireSupabase().auth.refreshSession();
            if (refreshError) throw refreshError;
            return { data: await fetchHabits(userId) };
          }
        } catch (error) {
          return handleSupabaseError(error);
        }
      },
      providesTags: (result, _error, userId) => [
        ...(result?.map(({ id }) => ({ type: "Habit" as const, id })) ?? []),
        { type: "Habit", id: `LIST-${userId}` },
      ],
    }),

    addHabit: builder.mutation<Habit, { input: NewHabitInput; userId: string }>({
      queryFn: async ({ input, userId }) => {
        try {
          const { data, error } = await requireSupabase()
            .from("habits")
            .insert({ user_id: userId, name: input.name, icon: input.icon, color: input.color })
            .select()
            .single();

          if (error) throw error;
          return { data: data as Habit };
        } catch (error) {
          return handleSupabaseError(error);
        }
      },
      invalidatesTags: (_result, _error, { userId }) => [
        { type: "Habit", id: `LIST-${userId}` },
      ],
    }),

    deleteHabit: builder.mutation<void, HabitMutationArgs>({
      queryFn: async ({ habitId, userId }) => {
        try {
          const { error } = await requireSupabase()
            .from("habits")
            .delete()
            .eq("id", habitId)
            .eq("user_id", userId);

          if (error) throw error;
          return { data: undefined };
        } catch (error) {
          return handleSupabaseError(error);
        }
      },
      invalidatesTags: (_result, _error, { habitId, userId }) => [
        { type: "Habit", id: habitId },
        { type: "Habit", id: `LIST-${userId}` },
      ],
    }),

    setCompletion: builder.mutation<void, SetCompletionArgs>({
      queryFn: async ({ habitId, userId, dateKey, completed }) => {
        try {
          const supabase = requireSupabase();
          const { error } = completed
            ? await supabase
                .from("habit_completions")
                .insert({ user_id: userId, habit_id: habitId, completed_date: dateKey })
            : await supabase
                .from("habit_completions")
                .delete()
                .eq("habit_id", habitId)
                .eq("completed_date", dateKey)
                .eq("user_id", userId);

          if (error && !(completed && error.code === "23505")) throw error;
          return { data: undefined };
        } catch (error) {
          return handleSupabaseError(error);
        }
      },
      invalidatesTags: (_result, _error, { habitId }) => [{ type: "Habit", id: habitId }],
    }),
  }),
});

export const {
  useGetHabitsQuery,
  useAddHabitMutation,
  useDeleteHabitMutation,
  useSetCompletionMutation,
} = habitsApi;
