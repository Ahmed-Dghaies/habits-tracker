import { useEffect, useMemo, useRef, useState } from "react";

import { hexToRgba } from "@/utils/colors";
import { addDays, monthLabel, startOfWeekSunday, toDateKey, formatLongDate } from "@/utils/dates";

interface HeatmapProps {
  color: string;
  completedDates: Set<string>;
  /** Number of weeks (columns) to display. */
  weeks?: number;
}

interface Cell {
  key: string;
  inFuture: boolean;
  done: boolean;
}

const CELL_SIZE_PX = 13;
const COLUMN_GAP_PX = 3;

/**
 * A GitHub-style contribution heatmap. Columns are weeks (Sun–Sat rows),
 * ending on the current week. Completed days use the habit color at full
 * intensity; empty days use a subtle muted square.
 */
export function Heatmap({ color, completedDates, weeks = 18 }: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => setContainerWidth(element.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const displayWeeks = useMemo(() => {
    if (containerWidth <= 0) return weeks;
    return Math.max(
      1,
      Math.floor((containerWidth + COLUMN_GAP_PX) / (CELL_SIZE_PX + COLUMN_GAP_PX)),
    );
  }, [containerWidth, weeks]);

  const { columns, monthMarkers } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentWeekStart = startOfWeekSunday(today);
    const firstWeekStart = addDays(currentWeekStart, -(displayWeeks - 1) * 7);

    const cols: Cell[][] = [];
    const markers: { index: number; label: string }[] = [];
    let lastMonth = -1;

    for (let w = 0; w < displayWeeks; w++) {
      const weekStart = addDays(firstWeekStart, w * 7);
      const column: Cell[] = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(weekStart, d);
        const key = toDateKey(date);
        column.push({
          key,
          inFuture: date.getTime() > today.getTime(),
          done: completedDates.has(key),
        });
      }
      // Month label appears on the first week that introduces a new month.
      const month = weekStart.getMonth();
      if (month !== lastMonth) {
        markers.push({ index: w, label: monthLabel(weekStart) });
        lastMonth = month;
      }
      cols.push(column);
    }

    return { columns: cols, monthMarkers: markers };
  }, [completedDates, displayWeeks]);

  return (
    <div
      ref={containerRef}
      className="w-full pb-1"
      role="img"
      aria-label="Completion history heatmap"
    >
      <div className="flex w-full flex-col gap-1 overflow-hidden">
        <div
          className="grid gap-0.75"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((_, i) => {
            const marker = monthMarkers.find((m) => m.index === i);
            return (
              <div key={i} className="min-w-0 text-[9px] leading-none text-muted-foreground">
                {marker ? marker.label : ""}
              </div>
            );
          })}
        </div>

        <div
          className="grid gap-0.75"
          style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
        >
          {columns.map((column, ci) => (
            <div key={ci} className="grid gap-0.75">
              {column.map((cell) => (
                <div
                  key={cell.key}
                  title={`${formatLongDate(cell.key)}${cell.done ? " · done" : ""}`}
                  className="aspect-square w-full rounded-[3px] transition-colors"
                  style={{
                    backgroundColor: cell.inFuture
                      ? "transparent"
                      : cell.done
                        ? color
                        : hexToRgba(color, 0.08),
                    outline: cell.done ? `1px solid ${hexToRgba(color, 0.5)}` : "none",
                    outlineOffset: "-1px",
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
