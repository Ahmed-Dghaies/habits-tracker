interface SummaryHeaderProps {
  completedToday: number
  total: number
}

export function SummaryHeader({ completedToday, total }: SummaryHeaderProps) {
  const pct = total === 0 ? 0 : Math.round((completedToday / total) * 100)
  const allDone = total > 0 && completedToday === total

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Completed today</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-card-foreground">
            {completedToday}
            <span className="text-muted-foreground"> / {total}</span>
            <span className="ml-2 text-base font-normal text-muted-foreground">habits</span>
          </p>
        </div>
        <span
          className="text-2xl font-semibold"
          style={{ color: allDone ? "var(--color-primary)" : "var(--color-muted-foreground)" }}
        >
          {pct}%
        </span>
      </div>

      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-[var(--color-primary)] transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      {allDone && (
        <p className="mt-3 text-sm font-medium text-[var(--color-primary)]">
          All habits complete for today. Nice work.
        </p>
      )}
    </div>
  )
}
