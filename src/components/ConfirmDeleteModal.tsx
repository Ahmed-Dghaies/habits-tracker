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

interface ConfirmDeleteModalProps {
  trigger: React.ReactNode;
  habitName: string;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmDeleteModal({ trigger, habitName, onConfirm }: ConfirmDeleteModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex items-center justify-center gap-2 text-destructive sm:justify-start">
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertDialogTitle>Delete habit?</AlertDialogTitle>
          </div>
          <AlertDialogDescription>
            This will permanently remove <span className="font-medium text-foreground">{habitName}</span> and its progress.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => void onConfirm()}
          >
            Delete habit
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
