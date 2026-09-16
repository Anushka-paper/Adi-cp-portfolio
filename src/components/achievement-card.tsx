import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AchievementCardProps {
  title: string;
  description: string;
  url: string;
}

// For platforms without a live-sync adapter (CodeChef, CSES, ICPC —
// no public API, no per-user profile, or not a personal-rating
// platform at all; see progress-tracker.md). Owner-curated via /admin.
export function AchievementCard({
  title,
  description,
  url,
}: AchievementCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener"
            className="text-sm font-medium underline underline-offset-4"
          >
            View
          </a>
        )}
      </CardContent>
    </Card>
  );
}
