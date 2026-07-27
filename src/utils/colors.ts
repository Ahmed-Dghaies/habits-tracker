/** Predefined palette used for habit colors and the random fallback. */
export const HABIT_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#a16207", // brown
  "#64748b", // slate
  "#5f5f5f", // light gray
  "#ffffff", // white
  "#7c2d12", // burnt orange
  "#166534", // dark green
  "#1d4ed8", // royal blue
  "#881337", // burgundy
] as const;

export function randomColor(): string {
  return HABIT_COLORS[Math.floor(Math.random() * HABIT_COLORS.length)];
}

/** Convert a #rrggbb hex string to an rgba() string with the given alpha. */
export function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const r = Number.parseInt(full.slice(0, 2), 16);
  const g = Number.parseInt(full.slice(2, 4), 16);
  const b = Number.parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
