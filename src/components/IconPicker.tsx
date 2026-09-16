import { Activity } from "lucide-react";

import { Button } from "@/components/ui/button";
import { hexToRgba } from "@/utils/colors";
import { HABIT_ICONS, HABIT_ICON_NAMES } from "@/utils/icons";

interface IconPickerProps {
  value: string;
  color: string;
  onChange: (icon: string) => void;
}

export function IconPicker({ value, color, onChange }: IconPickerProps) {
  return (
    <div
      className="grid max-h-40 grid-cols-6 gap-2 overflow-y-auto rounded-md border border-border bg-background/40 p-2"
      role="listbox"
      aria-label="Choose an icon"
    >
      {HABIT_ICON_NAMES.map((name) => {
        const Icon = HABIT_ICONS[name] ?? Activity;
        const selected = value === name;
        return (
          <Button
            key={name}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={name}
            onClick={() => onChange(name)}
            variant="ghost"
            size="icon"
            className="aspect-square rounded-md border transition-colors"
            style={
              selected
                ? { backgroundColor: hexToRgba(color, 0.16), borderColor: color, color }
                : { borderColor: "transparent", color: "var(--color-muted-foreground)" }
            }
          >
            <Icon size={18} aria-hidden="true" />
          </Button>
        );
      })}
    </div>
  );
}
