import { screen, waitFor, waitForElementToBeRemoved, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { Dashboard } from "@/pages/Dashboard";
import { renderWithProvider } from "@/test/renderWithProvider";
import { API_URL, server, USER_ID } from "@/test/server";
import { todayKey } from "@/utils/dates";

import type { User } from "@supabase/supabase-js";

const user: User = {
  id: USER_ID,
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2026-09-30T08:00:00.000Z",
  email: "person@example.com",
};

const dashboard = <Dashboard user={user} onSignOut={async () => undefined} />;

async function waitForHabits(): Promise<void> {
  await waitForElementToBeRemoved(() => screen.queryByLabelText("loading-habits"));
}

describe("Habit tracker dashboard", () => {
  it("Loads and displays the user's habits", async () => {
    renderWithProvider(dashboard);

    expect(screen.getByLabelText("loading-habits")).toBeInTheDocument();
    await waitForHabits();

    expect(screen.getByRole("heading", { name: "Drink water" })).toBeInTheDocument();
    expect(screen.getByText("0 total")).toBeInTheDocument();
  });

  it("Recovers when loading habits fails and the user retries", async () => {
    let attempts = 0;
    server.use(
      http.get(`${API_URL}/habits`, () => {
        attempts += 1;
        if (attempts === 1) {
          return HttpResponse.json({ message: "Database unavailable" }, { status: 500 });
        }
        return HttpResponse.json([
          {
            id: "habit-1",
            user_id: "user-1",
            name: "Drink water",
            icon: "Activity",
            color: "#22c55e",
            created_at: "2026-09-30T08:00:00.000Z",
          },
        ]);
      }),
    );
    const user = userEvent.setup();
    renderWithProvider(dashboard);

    expect(await screen.findByText("Could not load habits. Please try again.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry loading habits" }));

    expect(await screen.findByRole("heading", { name: "Drink water" })).toBeInTheDocument();
  });

  it("Adds a habit through the add-habit modal", async () => {
    const user = userEvent.setup();
    renderWithProvider(dashboard);
    await waitForHabits();

    await user.click(screen.getByRole("button", { name: "Add habit" }));
    const dialog = screen.getByRole("dialog", { name: "New habit" });
    await user.type(within(dialog).getByLabelText("habit-name"), "Read a book");
    await user.click(within(dialog).getByRole("button", { name: "Add habit" }));

    expect(await screen.findByRole("heading", { name: "Read a book" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "New habit" })).not.toBeInTheDocument();
  });

  it("Keeps the add modal open and shows an error when creation fails", async () => {
    server.use(
      http.post(`${API_URL}/habits`, () =>
        HttpResponse.json({ message: "Could not create habit" }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProvider(dashboard);
    await waitForHabits();

    await user.click(screen.getByRole("button", { name: "Add habit" }));
    const dialog = screen.getByRole("dialog", { name: "New habit" });
    await user.type(within(dialog).getByLabelText("habit-name"), "Read a book");
    await user.click(within(dialog).getByRole("button", { name: "Add habit" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Could not add the habit. Please try again.",
    );
    expect(dialog).toBeInTheDocument();
  });

  it("Marks today complete and then marks it incomplete", async () => {
    const user = userEvent.setup();
    renderWithProvider(dashboard);
    await waitForHabits();

    await user.click(screen.getByRole("button", { name: "Mark Drink water as done today" }));

    expect(
      await screen.findByRole("button", { name: "Mark Drink water as not done today" }),
    ).toHaveTextContent("Done");
    expect(screen.getByText("1 total")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Mark Drink water as not done today" }));

    expect(
      await screen.findByRole("button", { name: "Mark Drink water as done today" }),
    ).toHaveTextContent("Today");
    expect(screen.getByText("0 total")).toBeInTheDocument();
  });

  it("Logs a completion for a selected date", async () => {
    const user = userEvent.setup();
    renderWithProvider(dashboard);
    await waitForHabits();

    await user.click(screen.getByRole("button", { name: "Actions for Drink water" }));
    await user.click(screen.getByRole("menuitem", { name: "Log completion" }));

    const dateInput = screen.getByLabelText("Completion date");
    await user.clear(dateInput);
    await user.type(dateInput, "2026-09-29");
    await user.click(screen.getByRole("button", { name: "Log completion" }));

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Log completion" })).not.toBeInTheDocument();
    });
    expect(await screen.findByText("1 total")).toBeInTheDocument();
  });

  it("Keeps the completion modal open and shows an error when logging fails", async () => {
    server.use(
      http.post(`${API_URL}/habit_completions`, () =>
        HttpResponse.json({ message: "Could not log completion" }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProvider(dashboard);
    await waitForHabits();

    await user.click(screen.getByRole("button", { name: "Actions for Drink water" }));
    await user.click(screen.getByRole("menuitem", { name: "Log completion" }));
    const dialog = screen.getByRole("dialog", { name: "Log completion" });
    const dateInput = within(dialog).getByLabelText("Completion date");
    await user.clear(dateInput);
    await user.type(dateInput, "2026-09-29");
    await user.click(within(dialog).getByRole("button", { name: "Log completion" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Could not log this completion. Please try again.",
    );
    expect(dialog).toBeInTheDocument();
  });

  it("Deletes a habit after confirmation", async () => {
    const user = userEvent.setup();
    renderWithProvider(dashboard);
    await waitForHabits();

    await user.click(screen.getByRole("button", { name: "Actions for Drink water" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(screen.getByRole("alertdialog", { name: "Delete habit?" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete habit" }));

    expect(await screen.findByText("No habits yet")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Drink water" })).not.toBeInTheDocument();
  });

  it("Keeps the confirmation open and shows an error when deletion fails", async () => {
    server.use(
      http.delete(`${API_URL}/habits`, () =>
        HttpResponse.json({ message: "Could not delete habit" }, { status: 500 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProvider(dashboard);
    await waitForHabits();

    await user.click(screen.getByRole("button", { name: "Actions for Drink water" }));
    await user.click(screen.getByRole("menuitem", { name: "Delete" }));
    const dialog = screen.getByRole("alertdialog", { name: "Delete habit?" });
    await user.click(within(dialog).getByRole("button", { name: "Delete habit" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Could not delete this habit. Please try again.",
    );
    expect(dialog).toBeInTheDocument();
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("heading", { name: "Drink water" })).toBeInTheDocument();
  });

  it("Does not allow logging today twice", async () => {
    const user = userEvent.setup();
    renderWithProvider(dashboard);
    await waitForHabits();

    await user.click(screen.getByRole("button", { name: "Mark Drink water as done today" }));
    await screen.findByRole("button", { name: "Mark Drink water as not done today" });
    await user.click(screen.getByRole("button", { name: "Actions for Drink water" }));
    await user.click(screen.getByRole("menuitem", { name: "Log completion" }));

    expect(screen.getByLabelText("Completion date")).toHaveValue(todayKey());
    expect(screen.getByText("This date is already marked complete.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log completion" })).toBeDisabled();
  });
});
