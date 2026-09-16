"use client";

import { XAxis } from "@subframe/core";
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
      {/* No x-axis labels anymore, so nothing needs a fixed min-width —
          the chart just shrinks to fit the available width instead of
          scrolling, even as more rating history accumulates over time. */}
      <AreaChart
        data={data as Record<string, string | number>[]}
        index="date"
        categories={platforms}
        colors={platforms.map((p) => SERIES_COLORS[p] ?? "#888")}
        // hide (not xAxis={null}) — Recharts still needs a real axis
        // element wired to dataKey="date" to label the tooltip
        // correctly; removing it entirely left the tooltip falling
        // back to the data point's raw array index (e.g. "46").
        xAxis={<XAxis dataKey="date" hide />}
        // Hides the gradient fill via CSS (line-only look) rather than
        // overriding AreaChart's default Area children with our own —
        // this component's Area/XAxis are tied to a specific bundled
        // Recharts instance internally, and swapping in Area from our
        // own top-level "recharts" install (a different version) broke
        // Recharts' internal child-type checks with a runtime crash.
        className="[&_.recharts-area-area]:hidden"
      />
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
