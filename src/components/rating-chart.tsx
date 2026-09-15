"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
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

function buildChartData(snapshots: PlatformSnapshot[]): ChartPoint[] {
  const byDate = new Map<string, ChartPoint>();

  for (const snapshot of snapshots) {
    for (const point of snapshot.data?.ratingHistory ?? []) {
      const date = point.date.slice(0, 10);
      const row = byDate.get(date) ?? { date };
      row[snapshot.platform] = point.rating;
      byDate.set(date, row);
    }
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
}

export function RatingChart({ snapshots }: { snapshots: PlatformSnapshot[] }) {
  const data = buildChartData(snapshots);
  const platforms = snapshots
    .filter((s) => (s.data?.ratingHistory.length ?? 0) > 0)
    .map((s) => s.platform);

  if (data.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No rating history yet — run a sync to populate the chart.
      </p>
    );
  }

  return (
    <div className="h-72 w-full" role="img" aria-label="Unified rating timeline across platforms">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          {platforms.map((platform) => (
            <Line
              key={platform}
              type="monotone"
              dataKey={platform}
              stroke={SERIES_COLORS[platform] ?? "#888"}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      {/* Text fallback for accessibility / no-JS (PRD Story 5) */}
      <table className="sr-only">
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
  );
}
