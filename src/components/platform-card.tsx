import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlatformSnapshot } from "@/lib/db/schema";

const PLATFORM_LABELS: Record<string, string> = {
  codeforces: "Codeforces",
  leetcode: "LeetCode",
  atcoder: "AtCoder",
  codechef: "CodeChef",
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function PlatformCard({ snapshot }: { snapshot: PlatformSnapshot }) {
  const label = PLATFORM_LABELS[snapshot.platform] ?? snapshot.platform;
  const profile = snapshot.data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{label}</CardTitle>
        <Badge variant={snapshot.status === "ok" ? "default" : "destructive"}>
          {snapshot.status === "ok" ? "synced" : snapshot.status}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {profile ? (
          <>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold tabular-nums">
                {profile.currentRating ?? "—"}
              </span>
              {profile.rank && (
                <span className="text-sm text-muted-foreground">
                  {profile.rank}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Max rating: {profile.maxRating ?? "—"}
              {profile.solvedCount != null && ` · ${profile.solvedCount} solved`}
            </p>
            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noopener"
              className="text-sm font-medium underline underline-offset-4"
            >
              View on {label}
            </a>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sync failed: {snapshot.error ?? "unknown error"}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Last synced {relativeTime(snapshot.fetchedAt.toString())}
        </p>
      </CardContent>
    </Card>
  );
}
