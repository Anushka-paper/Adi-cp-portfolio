"use client";

import { useState } from "react";
import {
  format,
  subDays,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

interface ContributionDay {
  date: string; // ISO date string (e.g., "2025-09-13")
  count: number;
}

interface GitHubCalendarProps {
  data: ContributionDay[];
  colors?: string[]; // custom color scale (default: GitHub-like greens)
  /** Override the hover tooltip text for a day; defaults to "N contributions". */
  renderTooltip?: (day: ContributionDay) => string;
}

interface TooltipState {
  x: number;
  y: number;
  text: string;
}

// First entry (no activity) uses the app's own --muted token instead
// of a hardcoded light gray — resolves to light gray in light mode
// and dark gray in dark mode automatically, instead of a stark white
// square against the dark card background.
const DEFAULT_COLORS = ["var(--muted)", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

export function GitHubCalendar({
  data,
  colors = DEFAULT_COLORS,
  renderTooltip,
}: GitHubCalendarProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const today = new Date();
  const startDate = subDays(today, 364); // one year back
  const weeks = 53;

  const byDate = new Map(data.map((day) => [day.date, day]));

  function getColor(count: number) {
    if (count === 0) return colors[0];
    if (count === 1) return colors[1];
    if (count === 2) return colors[2];
    if (count === 3) return colors[3];
    return colors[4] ?? colors[colors.length - 1];
  }

  function renderWeeks() {
    const weeksArray = [];
    let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 0 });

    for (let i = 0; i < weeks; i++) {
      const weekDays = eachDayOfInterval({
        start: currentWeekStart,
        end: endOfWeek(currentWeekStart, { weekStartsOn: 0 }),
      });

      weeksArray.push(
        <div key={i} className="flex shrink-0 flex-col gap-1">
          {weekDays.map((day, index) => {
            const key = format(day, "yyyy-MM-dd");
            const contribution = byDate.get(key) ?? { date: key, count: 0 };
            const text = renderTooltip
              ? renderTooltip(contribution)
              : `${format(day, "PPP")}: ${contribution.count} contribution${
                  contribution.count === 1 ? "" : "s"
                }`;

            return (
              <div
                key={index}
                className="h-3 w-3 rounded-lg transition-transform hover:scale-125"
                style={{ backgroundColor: getColor(contribution.count) }}
                aria-label={text}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ x: rect.left + rect.width / 2, y: rect.top, text });
                }}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}
        </div>,
      );
      currentWeekStart = addDays(currentWeekStart, 7);
    }

    return weeksArray;
  }

  function renderMonthLabels() {
    const months = [];
    let currentMonth = startDate;
    for (let i = 0; i < 12; i++) {
      months.push(
        <span key={i} className="text-xs text-muted-foreground">
          {format(currentMonth, "MMM")}
        </span>,
      );
      currentMonth = addDays(currentMonth, 30);
    }
    return months;
  }

  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div className="rounded-lg border p-4">
      {/* overflow-x-auto alone implicitly sets overflow-y to auto too
          (per the CSS Overflow spec), which spawns a vertical
          scrollbar from a few px of sub-pixel text-line overflow in
          the day labels — overflow-y-hidden here is deliberate. This
          also means anything overflowing vertically (like a hover
          tooltip positioned above a cell) would get clipped, so the
          tooltip below is rendered as position:fixed instead, which
          escapes this container's overflow clipping entirely. */}
      <div className="scrollbar-themed flex overflow-x-auto overflow-y-hidden pb-2">
        <div className="mr-2 mt-5.5 flex shrink-0 flex-col justify-between">
          {dayLabels.map((day, i) => (
            <span key={i} className="h-3 text-xs text-muted-foreground">
              {day}
            </span>
          ))}
        </div>
        <div className="shrink-0">
          <div className="mb-2 flex justify-between gap-4">
            {renderMonthLabels()}
          </div>
          <div className="flex gap-1">{renderWeeks()}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2 text-xs">
        <span>Less</span>
        {colors.map((color) => (
          <div
            key={color}
            className="h-3 w-3 rounded-lg"
            style={{ backgroundColor: color }}
          />
        ))}
        <span>More</span>
      </div>

      {tooltip && (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-[calc(100%+8px)] rounded-md bg-foreground px-2 py-1 text-xs font-medium whitespace-nowrap text-background shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
          <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}

export type { ContributionDay, GitHubCalendarProps };
