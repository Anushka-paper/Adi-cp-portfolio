import type { PlatformSnapshot } from "@/lib/db/schema";

const WEEKS_TO_SHOW = 26;
const DAY_MS = 24 * 60 * 60 * 1000;

const LEVEL_CLASSES = [
  "bg-muted",
  "bg-lime-200 dark:bg-lime-900",
  "bg-lime-400 dark:bg-lime-700",
  "bg-lime-500 dark:bg-lime-600",
  "bg-lime-600 dark:bg-lime-500",
];

function levelFor(count: number): number {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

interface DayCell {
  date: string;
  total: number;
  byPlatform: Record<string, number>;
}

function buildCells(snapshots: PlatformSnapshot[]): DayCell[] {
  const byDate = new Map<string, DayCell>();
  const today = new Date();
  const start = new Date(today.getTime() - WEEKS_TO_SHOW * 7 * DAY_MS);

  for (let d = new Date(start); d <= today; d = new Date(d.getTime() + DAY_MS)) {
    const date = d.toISOString().slice(0, 10);
    byDate.set(date, { date, total: 0, byPlatform: {} });
  }

  for (const snapshot of snapshots) {
    for (const day of snapshot.data?.activityCalendar ?? []) {
      const cell = byDate.get(day.date);
      if (!cell) continue; // outside the visible window
      cell.total += day.count;
      cell.byPlatform[snapshot.platform] = day.count;
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

  const weeks: DayCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week) => (
          <div key={week[0].date} className="flex flex-col gap-1">
            {week.map((cell) => (
              <div
                key={cell.date}
                title={`${cell.date}: ${cell.total} submission${cell.total === 1 ? "" : "s"}${
                  Object.entries(cell.byPlatform).length
                    ? " (" +
                      Object.entries(cell.byPlatform)
                        .map(([p, c]) => `${p}: ${c}`)
                        .join(", ") +
                      ")"
                    : ""
                }`}
                className={`h-3 w-3 rounded-sm ${LEVEL_CLASSES[levelFor(cell.total)]}`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Text fallback for accessibility / no hover affordance on touch */}
      <table className="sr-only">
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
  );
}
