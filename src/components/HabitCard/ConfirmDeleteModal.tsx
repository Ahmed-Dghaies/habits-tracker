import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { HabitActionWithoutArguments } from "@/hooks/useHabits";

interface ConfirmDeleteModalProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  habitName: string;
  action: HabitActionWithoutArguments<boolean>;
}

export function ConfirmDeleteModal({
  trigger,
  open,
  onOpenChange,
  habitName,
  action,
}: ConfirmDeleteModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex items-center justify-center gap-2 text-destructive sm:justify-start">
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This will permanently remove <span className="font-medium text-foreground">{habitName}</span> and its progress.
          </AlertDialogDescription>
          {action.isError && (
            <p className="text-sm text-destructive" role="alert">
              Could not delete this habit. Please try again.
            </p>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={action.isLoading}
            onClick={(event) => {
              event.preventDefault();
              void action.handler().then((deleted) => {
                if (deleted) onOpenChange?.(false);
              });
            }}
          >
            {action.isLoading ? "Deleting…" : "Delete habit"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
