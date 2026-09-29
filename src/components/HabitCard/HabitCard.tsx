import { Activity, Check, Flame, TrendingUp } from "lucide-react";

import { HabitActions } from "@/components/HabitCard/HabitActions";
import { Heatmap } from "@/components/HabitCard/Heatmap";
import { Button } from "@/components/ui/button";
import { hexToRgba } from "@/utils/colors";
import { todayKey } from "@/utils/dates";
import { HABIT_ICONS } from "@/utils/icons";
import { currentStreak, momentum } from "@/utils/stats";

import type { HabitAction, HabitIdArguments, LogCompletionArguments } from "@/hooks/useHabits";
import type { HabitWithCompletions } from "@/types";

interface HabitCardProps {
  habit: HabitWithCompletions;
  toggleTodayAction: HabitAction<HabitIdArguments, void>;
  deleteAction: HabitAction<HabitIdArguments, boolean>;
  logCompletionAction: HabitAction<LogCompletionArguments, boolean>;
}

const HabitCard = ({
  habit,
  toggleTodayAction,
  deleteAction,
  logCompletionAction,
}: HabitCardProps) => {
  const Icon = HABIT_ICONS[habit.icon] ?? Activity;
  const doneToday = habit.completedDates.includes(todayKey());
  const streak = currentStreak(habit.completedDates);
  const momentumScore = momentum(habit.completedDates);
  const total = habit.completedDates.length;

  return (
    <article className="animate-fade-in rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
            style={{ backgroundColor: hexToRgba(habit.color, 0.16), color: habit.color }}
          >
            <Icon size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-medium text-card-foreground">{habit.name}</h3>
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              {streak > 0 && (
                <span className="inline-flex items-center gap-1" style={{ color: habit.color }}>
                  <Flame size={12} aria-hidden="true" />
                  {streak} day{streak === 1 ? "" : "s"}
                </span>
              )}
              <span className="inline-flex items-center gap-1" style={{ color: habit.color }}>
                <TrendingUp size={12} aria-hidden="true" />
                {Math.round(momentumScore)}%
                <span className="text-[10px] tracking-[0.08em]">Momentum</span>
              </span>
              <span>{total} total</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <HabitActions
            habitId={habit.id}
            habitName={habit.name}
            completedDates={habit.completedDates}
            deleteAction={deleteAction}
            logCompletionAction={logCompletionAction}
          />
          <Button
            type="button"
            onClick={() => void toggleTodayAction.handler({ habitId: habit.id })}
            disabled={toggleTodayAction.isLoading}
            aria-invalid={toggleTodayAction.isError}
            aria-pressed={doneToday}
            aria-label={
              doneToday
                ? `Mark ${habit.name} as not done today`
                : `Mark ${habit.name} as done today`
            }
            className="h-9 gap-1.5 rounded-md border px-3 text-sm font-medium transition-all active:scale-95"
            style={
              doneToday
                ? { backgroundColor: habit.color, borderColor: habit.color, color: "#0b0f0d" }
                : {
                    borderColor: hexToRgba(habit.color, 0.4),
                    color: habit.color,
                    backgroundColor: "transparent",
                  }
            }
          >
            <Check size={16} className={doneToday ? "animate-pop" : ""} aria-hidden="true" />
            {doneToday ? "Done" : "Today"}
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <Heatmap color={habit.color} completedDates={habit.completedDates} />
      </div>
    </article>
  );
};

export default HabitCard;
