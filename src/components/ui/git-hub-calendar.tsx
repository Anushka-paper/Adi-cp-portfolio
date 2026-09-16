"use client";

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
  /** Override the hover title text for a day; defaults to "N contributions". */
  renderTooltip?: (day: ContributionDay) => string;
}

const DEFAULT_COLORS = ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"];

export function GitHubCalendar({
  data,
  colors = DEFAULT_COLORS,
  renderTooltip,
}: GitHubCalendarProps) {
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
        <div key={i} className="flex flex-col gap-1">
          {weekDays.map((day, index) => {
            const key = format(day, "yyyy-MM-dd");
            const contribution = byDate.get(key) ?? { date: key, count: 0 };
            const title = renderTooltip
              ? renderTooltip(contribution)
              : `${format(day, "PPP")}: ${contribution.count} contribution${
                  contribution.count === 1 ? "" : "s"
                }`;

            return (
              <div
                key={index}
                className="h-3 w-3 rounded-lg"
                style={{ backgroundColor: getColor(contribution.count) }}
                title={title}
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

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="rounded-lg border p-4">
      <div className="flex overflow-x-auto">
        <div className="mr-2 mt-5.5 flex flex-col justify-between">
          {dayLabels.map((day) => (
            <span key={day} className="h-3 text-xs text-muted-foreground">
              {day}
            </span>
          ))}
        </div>
        <div>
          <div className="mb-2 flex w-full justify-between gap-4">
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
    </div>
  );
}

export type { ContributionDay, GitHubCalendarProps };
