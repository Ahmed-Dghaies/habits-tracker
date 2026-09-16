import { Activity, Check, Flame, TrendingUp, Trash2 } from "lucide-react";

import { ConfirmDeleteModal } from "@/components/ConfirmDeleteModal";
import { Heatmap } from "@/components/Heatmap";
import { Button } from "@/components/ui/button";
import { hexToRgba } from "@/utils/colors";
import { todayKey } from "@/utils/dates";
import { HABIT_ICONS } from "@/utils/icons";
import { currentStreak, momentum } from "@/utils/stats";

import type { HabitWithCompletions } from "@/types";

interface HabitCardProps {
  habit: HabitWithCompletions;
  onToggleToday: (habitId: string) => void;
  onDelete: (habitId: string) => Promise<void>;
}

export function HabitCard({ habit, onToggleToday, onDelete }: HabitCardProps) {
  const Icon = HABIT_ICONS[habit.icon] ?? Activity;
  const doneToday = habit.completedDates.has(todayKey());
  const streak = currentStreak(habit.completedDates);
  const momentumScore = momentum(habit.completedDates);
  const total = habit.completedDates.size;

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
          <ConfirmDeleteModal
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Delete ${habit.name}`}
                className="h-9 w-9 rounded-md border-0 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            }
            habitName={habit.name}
            onConfirm={async () => {
              await onDelete(habit.id);
            }}
          />
          <Button
            type="button"
            onClick={() => onToggleToday(habit.id)}
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
}
