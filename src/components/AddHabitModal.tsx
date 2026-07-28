import { useEffect, useRef, useState } from "react";

import { Activity, X } from "lucide-react";

import { IconPicker } from "@/components/IconPicker";
import { HABIT_COLORS, randomColor } from "@/utils/colors";
import { HABIT_ICONS } from "@/utils/icons";

import type { NewHabitInput } from "@/types";

interface AddHabitModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewHabitInput) => Promise<boolean>;
}

export function AddHabitModal({ open, onClose, onCreate }: AddHabitModalProps) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Activity");
  const [color, setColor] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  // Preview color: chosen color, or the first palette color as a hint.
  const previewColor = color ?? HABIT_COLORS[0];
  const PreviewIcon = HABIT_ICONS[icon] ?? Activity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      // Assign a random palette color if the user didn't pick one.
      const created = await onCreate({ name: trimmed, icon, color: color ?? randomColor() });
      if (created) {
        onClose();
      }
    } catch (err) {
      console.error("Failed to create habit:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-habit-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in w-full max-w-md rounded-t-2xl border border-border bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="add-habit-title" className="text-lg font-semibold text-card-foreground">
            New habit
          </h2>
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
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md"
              style={{ backgroundColor: `${previewColor}29`, color: previewColor }}
            >
              <PreviewIcon size={22} aria-hidden="true" />
            </span>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Drink water"
              maxLength={60}
              required
              className="h-11 w-full rounded-md border border-border bg-background px-3 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-(--color-primary)"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Icon</label>
            <IconPicker value={icon} color={previewColor} onChange={setIcon} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Color <span className="font-normal">(optional — random if unset)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Select color ${c}`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className="h-8 w-8 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 2px var(--color-card), 0 0 0 4px ${c}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim() || submitting}
            className="mt-1 h-11 rounded-md bg-(--color-primary) font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add habit"}
          </button>
        </form>
      </div>
    </div>
  );
}
