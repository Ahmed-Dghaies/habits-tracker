import { useMemo } from "react";

import { RefreshCw } from "lucide-react";

import HabitCard from "@/components/HabitCard";
import { SummaryHeader, EmptyState } from "@/components/SummaryHeader";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/hooks/useHabits";
import { todayKey } from "@/utils/dates";

import LoadingHabits from "./LoadingHabits";

import type { User } from "@supabase/supabase-js";

const HabitsList = ({ user, openAddHabitModal }: { user: User; openAddHabitModal: () => void }) => {
  const {
    getHabits: {
      data: habits,
      isLoading: isLoadingHabits,
      isError: isErrorHabits,
      refetch: refetchHabits,
    },
    toggleToday,
    removeHabit,
    logCompletion,
  } = useHabits(user.id);

  const completedToday = useMemo(() => {
    const key = todayKey();
    return habits.filter((h) => h.completedDates.includes(key)).length;
  }, [habits]);
  return (
    <>
      {isLoadingHabits ? (
        <LoadingHabits />
      ) : isErrorHabits ? (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-foreground">
          <p>Could not load habits. Please try again.</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={refetchHabits}
            aria-label="Retry loading habits"
            title="Retry loading habits"
            className="h-8 w-8 rounded-md text-foreground hover:bg-destructive/15"
          >
            <RefreshCw size={18} aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <SummaryHeader completedToday={completedToday} total={habits.length} />

          {habits.length === 0 ? (
            <EmptyState onAdd={openAddHabitModal} />
          ) : (
            <div className="flex flex-col gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  toggleTodayAction={toggleToday}
                  deleteAction={removeHabit}
                  logCompletionAction={logCompletion}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default HabitsList;
