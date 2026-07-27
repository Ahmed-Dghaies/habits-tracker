import { HABIT_ICON_NAMES, getHabitIcon } from "@/utils/icons"
import { hexToRgba } from "@/utils/colors"

interface IconPickerProps {
  value: string
  color: string
  onChange: (icon: string) => void
}

export function IconPicker({ value, color, onChange }: IconPickerProps) {
  return (
    <div
      className="grid max-h-40 grid-cols-6 gap-2 overflow-y-auto rounded-md border border-border bg-background/40 p-2"
      role="listbox"
      aria-label="Choose an icon"
    >
      {HABIT_ICON_NAMES.map((name) => {
        const Icon = getHabitIcon(name)
        const selected = value === name
        return (
          <button
            key={name}
            type="button"
            role="option"
            aria-selected={selected}
            aria-label={name}
            onClick={() => onChange(name)}
            className="flex aspect-square items-center justify-center rounded-md border transition-colors"
            style={
              selected
                ? { backgroundColor: hexToRgba(color, 0.16), borderColor: color, color }
                : { borderColor: "transparent", color: "var(--color-muted-foreground)" }
            }
          >
            <Icon size={18} aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
