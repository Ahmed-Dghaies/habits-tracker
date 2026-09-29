import { useState } from "react";

import { CalendarCheck, Ellipsis, Trash2 } from "lucide-react";
import { DropdownMenu } from "radix-ui";

import { ConfirmDeleteModal } from "@/components/HabitCard/ConfirmDeleteModal";
import { LogCompletionModal } from "@/components/HabitCard/LogCompletionModal";
import { Button } from "@/components/ui/button";

import type { HabitAction, HabitIdArguments, LogCompletionArguments } from "@/hooks/useHabits";

interface HabitActionsProps {
  habitId: string;
  habitName: string;
  completedDates: string[];
  deleteAction: HabitAction<HabitIdArguments, boolean>;
  logCompletionAction: HabitAction<LogCompletionArguments, boolean>;
}

const itemClassName =
  "flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none data-highlighted:bg-muted data-highlighted:text-foreground";

export function HabitActions({
  habitId,
  habitName,
  completedDates,
  deleteAction,
  logCompletionAction,
}: HabitActionsProps) {
  const [logOpen, setLogOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Actions for ${habitName}`}
            className="h-9 w-9 rounded-md border-0 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Ellipsis size={18} aria-hidden="true" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="z-50 min-w-44 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg outline-none"
          >
            <DropdownMenu.Item className={itemClassName} onSelect={() => setLogOpen(true)}>
              <CalendarCheck size={16} aria-hidden="true" />
              Log completion
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className={`${itemClassName} text-destructive data-highlighted:bg-destructive/10 data-highlighted:text-destructive`}
              onSelect={() => setDeleteOpen(true)}
            >
              <Trash2 size={16} aria-hidden="true" />
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <LogCompletionModal
        open={logOpen}
        habitName={habitName}
        completedDates={completedDates}
        onClose={() => setLogOpen(false)}
        action={{
          handler: ({ dateKey }) => logCompletionAction.handler({ habitId, dateKey }),
          isLoading: logCompletionAction.isLoading,
          isError: logCompletionAction.isError,
        }}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        habitName={habitName}
        action={{
          handler: () => deleteAction.handler({ habitId }),
          isLoading: deleteAction.isLoading,
          isError: deleteAction.isError,
        }}
      />
    </>
  );
}
