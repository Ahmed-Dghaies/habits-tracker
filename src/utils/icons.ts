import {
  Activity,
  BookOpen,
  Dumbbell,
  Droplet,
  Moon,
  Sun,
  Heart,
  Brain,
  Coffee,
  Apple,
  Bike,
  Footprints,
  Music,
  Pencil,
  Code,
  Leaf,
  Flame,
  Smile,
  Target,
  Wallet,
  PawPrint,
  Sparkles,
  type LucideIcon,
} from "lucide-react"

/** Curated set of icons available in the picker, keyed by a stable string name. */
export const HABIT_ICONS: Record<string, LucideIcon> = {
  Activity,
  BookOpen,
  Dumbbell,
  Droplet,
  Moon,
  Sun,
  Heart,
  Brain,
  Coffee,
  Apple,
  Bike,
  Footprints,
  Music,
  Pencil,
  Code,
  Leaf,
  Flame,
  Smile,
  Target,
  Wallet,
  PawPrint,
  Sparkles,
}

export const HABIT_ICON_NAMES = Object.keys(HABIT_ICONS)

/** Resolve an icon by name, falling back to a sensible default. */
export function getHabitIcon(name: string): LucideIcon {
  return HABIT_ICONS[name] ?? Activity
}
