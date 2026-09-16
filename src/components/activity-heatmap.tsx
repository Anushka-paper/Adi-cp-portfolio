"use client";

import type { PlatformSnapshot } from "@/lib/db/schema";
import { GitHubCalendar, type ContributionDay } from "@/components/ui/git-hub-calendar";

interface DayCell {
  date: string;
  total: number;
  byPlatform: Record<string, number>;
}

function buildCells(snapshots: PlatformSnapshot[]): DayCell[] {
  const byDate = new Map<string, DayCell>();

  for (const snapshot of snapshots) {
    for (const day of snapshot.data?.activityCalendar ?? []) {
      const cell = byDate.get(day.date) ?? {
        date: day.date,
        total: 0,
        byPlatform: {},
      };
      cell.total += day.count;
      cell.byPlatform[snapshot.platform] = day.count;
      byDate.set(day.date, cell);
    }
  }

  return Array.from(byDate.values());
}

export function ActivityHeatmap({
  snapshots,
}: {
  snapshots: PlatformSnapshot[];
}) {
  const cells = buildCells(snapshots);
  const hasActivity = cells.some((c) => c.total > 0);

  if (!hasActivity) {
    return (
      <p className="text-sm text-muted-foreground">
        No submission activity yet — run a sync to populate the heatmap.
      </p>
    );
  }

  const data: ContributionDay[] = cells.map((c) => ({
    date: c.date,
    count: c.total,
  }));
  const byDate = new Map(cells.map((c) => [c.date, c]));

  return (
    <div>
      <GitHubCalendar
        data={data}
        renderTooltip={(day) => {
          const cell = byDate.get(day.date);
          const breakdown = cell
            ? Object.entries(cell.byPlatform)
                .map(([platform, count]) => `${platform}: ${count}`)
                .join(", ")
            : "";
          return `${day.date}: ${day.count} submission${
            day.count === 1 ? "" : "s"
          }${breakdown ? ` (${breakdown})` : ""}`;
        }}
      />

      {/* Text fallback for accessibility / no hover affordance on touch.
          sr-only goes on a block wrapper, not <table> itself — see
          the note in rating-chart.tsx for why. */}
      <div className="sr-only">
        <table>
          <caption>Daily submission activity across platforms</caption>
          <thead>
            <tr>
              <th>Date</th>
              <th>Submissions</th>
            </tr>
          </thead>
          <tbody>
            {cells
              .filter((c) => c.total > 0)
              .map((c) => (
                <tr key={c.date}>
                  <td>{c.date}</td>
                  <td>{c.total}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
