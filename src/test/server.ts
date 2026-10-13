import { Collection } from "@msw/data";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { z } from "zod";

import type { Habit, HabitCompletion } from "@/types";

const API_URL = "http://localhost:54321/rest/v1";
const USER_ID = "user-1";

function createHabit(overrides: Partial<Habit> = {}): Habit {
  return {
    id: "habit-1",
    user_id: USER_ID,
    name: "Drink water",
    icon: "Activity",
    color: "#22c55e",
    created_at: "2026-09-30T08:00:00.000Z",
    ...overrides,
  };
}

const habitSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  created_at: z.string(),
});

const completionSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  habit_id: z.string(),
  completed_date: z.string(),
  created_at: z.string(),
});

export const testDatabase = {
  habits: new Collection({ schema: habitSchema }),
  completions: new Collection({ schema: completionSchema }),
};

export async function resetTestDatabase(): Promise<void> {
  testDatabase.habits.clear();
  testDatabase.completions.clear();
  await testDatabase.habits.create(createHabit());
}

export const server = setupServer(
  http.get(`${API_URL}/habits`, () => HttpResponse.json(testDatabase.habits.findMany())),

  http.post(`${API_URL}/habits`, async ({ request }) => {
    const input = (await request.json()) as Pick<Habit, "user_id" | "name" | "icon" | "color">;
    const habit = createHabit({
      ...input,
      id: `habit-${testDatabase.habits.count() + 1}`,
      created_at: new Date().toISOString(),
    });
    const createdHabit = await testDatabase.habits.create(habit);
    return HttpResponse.json(createdHabit, { status: 201 });
  }),

  http.delete(`${API_URL}/habits`, ({ request }) => {
    const habitId = new URL(request.url).searchParams.get("id")?.replace("eq.", "");
    testDatabase.habits.deleteMany((query) => query.where({ id: habitId }));
    testDatabase.completions.deleteMany((query) => query.where({ habit_id: habitId }));
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API_URL}/habit_completions`, () =>
    HttpResponse.json(testDatabase.completions.findMany()),
  ),

  http.post(`${API_URL}/habit_completions`, async ({ request }) => {
    const input = (await request.json()) as Pick<
      HabitCompletion,
      "user_id" | "habit_id" | "completed_date"
    >;
    const exists = testDatabase.completions.findFirst((query) =>
      query.where({
        habit_id: input.habit_id,
        completed_date: input.completed_date,
      }),
    );

    if (!exists) {
      await testDatabase.completions.create({
        ...input,
        id: `completion-${testDatabase.completions.count() + 1}`,
        created_at: new Date().toISOString(),
      });
    }

    return HttpResponse.json(null, { status: 201 });
  }),

  http.delete(`${API_URL}/habit_completions`, ({ request }) => {
    const searchParams = new URL(request.url).searchParams;
    const habitId = searchParams.get("habit_id")?.replace("eq.", "");
    const dateKey = searchParams.get("completed_date")?.replace("eq.", "");
    testDatabase.completions.deleteMany((query) =>
      query.where({ habit_id: habitId, completed_date: dateKey }),
    );
    return new HttpResponse(null, { status: 204 });
  }),
);

export { API_URL, USER_ID };
