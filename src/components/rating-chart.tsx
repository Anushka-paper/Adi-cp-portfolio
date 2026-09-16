"use client";

import { AreaChart } from "@/components/ui/area-chart";
import type { PlatformSnapshot } from "@/lib/db/schema";

const SERIES_COLORS: Record<string, string> = {
  codeforces: "#3b82f6",
  leetcode: "#f59e0b",
  atcoder: "#8b5cf6",
  codechef: "#ef4444",
};

interface ChartPoint {
  date: string;
  [platform: string]: string | number | undefined;
}

function buildChartData(
  snapshots: PlatformSnapshot[],
  platforms: string[],
): ChartPoint[] {
  const byDate = new Map<string, ChartPoint>();

  for (const snapshot of snapshots) {
    for (const point of snapshot.data?.ratingHistory ?? []) {
      const date = point.date.slice(0, 10);
      const row = byDate.get(date) ?? { date };
      row[snapshot.platform] = point.rating;
      byDate.set(date, row);
    }
  }

  const rows = Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // A rating holds steady between contests — forward-fill so the area
  // doesn't gap out on dates only some platforms had a contest.
  const lastKnown: Record<string, number | undefined> = {};
  for (const row of rows) {
    for (const platform of platforms) {
      if (row[platform] != null) {
        lastKnown[platform] = row[platform] as number;
      } else if (lastKnown[platform] != null) {
        row[platform] = lastKnown[platform];
      }
    }
  }

  return rows;
}

export function RatingChart({ snapshots }: { snapshots: PlatformSnapshot[] }) {
  const platforms = snapshots
    .filter((s) => (s.data?.ratingHistory.length ?? 0) > 0)
    .map((s) => s.platform);
  const data = buildChartData(snapshots, platforms);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No rating history yet — run a sync to populate the chart.
      </p>
    );
  }

  return (
    <div className="w-full min-w-0" role="img" aria-label="Unified rating timeline across platforms">
      {/* min-width keeps the legend/axis labels from clipping on very
          narrow screens — scrolls instead of cutting off text. */}
      <div className="scrollbar-themed overflow-x-auto overflow-y-hidden">
        <AreaChart
          className="min-w-105"
          data={data as Record<string, string | number>[]}
          index="date"
          categories={platforms}
          colors={platforms.map((p) => SERIES_COLORS[p] ?? "#888")}
        />
      </div>
      {/* Text fallback for accessibility / no-JS (PRD Story 5). The
          sr-only class must go on a block-level wrapper, not the
          <table> itself — table auto-layout sizing overrides the
          tiny width/height sr-only relies on, otherwise this ends up
          an invisible but full-size box that blows out page height. */}
      <div className="sr-only">
        <table>
          <caption>Rating history by platform and date</caption>
          <thead>
            <tr>
              <th>Date</th>
              {platforms.map((p) => (
                <th key={p}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.date}>
                <td>{row.date}</td>
                {platforms.map((p) => (
                  <td key={p}>{row[p] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
