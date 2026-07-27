import { Sparkles } from "lucide-react";

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-(--color-primary)">
        <Sparkles size={22} aria-hidden="true" />
      </span>
      <h2 className="mt-4 font-medium text-card-foreground">No habits yet</h2>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
        Create your first habit and start building a streak. Tap the button below to begin.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 h-10 rounded-md bg-(--color-primary) px-4 text-sm font-medium text-primary-foreground"
      >
        Add your first habit
      </button>
    </div>
  );
}
