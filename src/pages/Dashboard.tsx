import { useMemo, useState } from "react";

import { LogOut, Plus, RefreshCw } from "lucide-react";

import { AddHabitModal } from "@/components/AddHabitModal";
import { EmptyState } from "@/components/EmptyState";
import { HabitCard } from "@/components/HabitCard";
import { SummaryHeader } from "@/components/SummaryHeader";
import { useHabits } from "@/hooks/useHabits";
import { todayKey } from "@/utils/dates";

interface DashboardProps {
  userId: string;
  userEmail?: string | null;
  onSignOut: () => Promise<void>;
}

function getUserInitials(userEmail: string | null | undefined, userId: string): string {
  const username = userEmail?.split("@")[0] || userId;
  const initials = username
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (initials || username.slice(0, 2)).toUpperCase();
}

export function Dashboard({ userId, userEmail, onSignOut }: DashboardProps) {
  const { habits, loading, error, addHabit, removeHabit, toggleToday, reload } = useHabits(userId);
  const [modalOpen, setModalOpen] = useState(false);
  const userInitials = getUserInitials(userEmail, userId);

  const completedToday = useMemo(() => {
    const key = todayKey();
    return habits.filter((h) => h.completedDates.has(key)).length;
  }, [habits]);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto min-h-dvh max-w-2xl px-4 pb-28 pt-[max(1.5rem,env(safe-area-inset-top))]">
      <header className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{today}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Habits</h1>
        </div>
        <div className="flex items-center gap-2">
          <div
            aria-label={`Signed in as ${userEmail ?? userId}`}
            title={userEmail ?? userId}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-xs font-semibold text-card-foreground"
          >
            {userInitials}
          </div>
          <button
            type="button"
            onClick={() => void onSignOut()}
            aria-label="Sign out"
            title="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-card-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void reload()}
            aria-label="Retry loading habits"
            title="Retry loading habits"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground transition-colors hover:bg-destructive/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <RefreshCw size={18} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <SummaryHeader completedToday={completedToday} total={habits.length} />

          {habits.length === 0 ? (
            <EmptyState onAdd={() => setModalOpen(true)} />
          ) : (
            <div className="flex flex-col gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  onToggleToday={toggleToday}
                  onDelete={removeHabit}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={() => setModalOpen(true)}
        aria-label="Add habit"
        className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 flex h-14 w-14 items-center justify-center rounded-full bg-(--color-primary) text-primary-foreground shadow-lg shadow-black/40 transition-transform active:scale-90 sm:right-[max(1.25rem,calc(50vw-20rem+1.25rem))]"
      >
        <Plus size={26} aria-hidden="true" />
      </button>

      <AddHabitModal
        key={modalOpen ? "open" : "closed"}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={addHabit}
      />
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-28 animate-pulse rounded-lg border border-border bg-card" />
      <div className="h-40 animate-pulse rounded-lg border border-border bg-card" />
      <div className="h-40 animate-pulse rounded-lg border border-border bg-card" />
    </div>
  );
}
