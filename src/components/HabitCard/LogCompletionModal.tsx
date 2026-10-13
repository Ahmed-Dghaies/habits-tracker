import { useEffect, useState } from "react";

import { CalendarCheck, CheckCircle2, X } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { todayKey } from "@/utils/dates";

import type { CompletionDateArguments, HabitAction } from "@/hooks/useHabits";

interface LogCompletionModalProps {
  open: boolean;
  habitName: string;
  completedDates: string[];
  onClose: () => void;
  action: HabitAction<CompletionDateArguments, boolean>;
}

export function LogCompletionModal({
  open,
  habitName,
  completedDates,
  onClose,
  action,
}: LogCompletionModalProps) {
  const [dateKey, setDateKey] = useState(todayKey());
  const alreadyCompleted = completedDates.includes(dateKey);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (alreadyCompleted || action.isLoading) return;
    if (await action.handler({ dateKey })) onClose();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="log-completion-title"
        onClick={(event) => event.stopPropagation()}
        className="animate-scale-in w-full max-w-sm rounded-t-2xl border border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" aria-hidden="true" />
              <h2 id="log-completion-title" className="text-lg font-semibold text-card-foreground">
                Log completion
              </h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the day you completed this habit.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-md bg-muted px-3 py-2.5">
            <CheckCircle2 className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Selected habit</p>
              <p className="truncate text-sm font-medium text-card-foreground">{habitName}</p>
            </div>
          </div>

          <div>
            <label
              htmlFor="completion-date"
              className="mb-1.5 block text-sm font-medium text-card-foreground"
            >
              Completion date
            </label>
            <input
              id="completion-date"
              type="date"
              value={dateKey}
              max={todayKey()}
              onChange={(event) => setDateKey(event.target.value)}
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground outline-none transition-colors focus:border-(--color-primary)"
              autoFocus
              required
            />
            {alreadyCompleted && (
              <p className="mt-2 text-xs text-muted-foreground">
                This date is already marked complete.
              </p>
            )}
          </div>

          <Button type="submit" disabled={alreadyCompleted || action.isLoading} className="h-11">
            {action.isLoading ? "Logging…" : "Log completion"}
          </Button>
          {action.isError && (
            <p className="text-sm text-destructive" role="alert">
              Could not log this completion. Please try again.
            </p>
          )}
        </form>
      </div>
    </div>,
    document.body,
  );
}
