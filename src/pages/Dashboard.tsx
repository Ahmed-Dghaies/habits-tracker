import { useMemo, useState } from "react";

import { Plus } from "lucide-react";

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

export function Dashboard({ userId, userEmail, onSignOut }: DashboardProps) {
  const { habits, loading, error, addHabit, removeHabit, toggleToday } = useHabits(userId);
  const [modalOpen, setModalOpen] = useState(false);

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
        <div className="flex flex-col items-end gap-2">
          <div className="rounded-full border border-border bg-card px-3 py-1 text-right text-xs text-muted-foreground">
            <p className="font-medium text-card-foreground">Signed in</p>
            <p className="max-w-[12rem] truncate">{userEmail ?? userId}</p>
          </div>
          <button
            type="button"
            onClick={() => void onSignOut()}
            className="h-9 rounded-md border border-border px-3 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      </header>

      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
          {error}
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
