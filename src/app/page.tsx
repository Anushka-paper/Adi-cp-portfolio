import { ProfileCard } from "@/components/profile-card";
import { PlatformCard } from "@/components/platform-card";
import { RatingChart } from "@/components/rating-chart";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSnapshots } from "@/lib/get-snapshots";
import { getProfileContent } from "@/lib/profile-content";
import { getNeonRankColor } from "@/lib/codeforces-rank-color";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function Home() {
  const [snapshots, content] = await Promise.all([
    getSnapshots(),
    getProfileContent(),
  ]);

  const codeforcesProfile = snapshots.find(
    (s) => s.platform === "codeforces",
  )?.data;
  const accentColor = getNeonRankColor(codeforcesProfile?.currentRating);
  const glowText = codeforcesProfile?.rank
    ? `Codeforces ${capitalize(codeforcesProfile.rank)}`
    : "Codeforces Expert";

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-16 px-4 py-24">
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle />
      </div>

      <ProfileCard
        name={content.name}
        role={content.role}
        email={content.email}
        avatarSrc={content.avatarUrl}
        statusText="Grinding rating"
        accentColor={accentColor}
        glowText={glowText}
      />

      <section className="w-full space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Rating history
        </h2>
        <RatingChart snapshots={snapshots} />
      </section>

      <section className="w-full space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Activity
        </h2>
        <ActivityHeatmap snapshots={snapshots} />
      </section>

      <section className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {snapshots.length === 0 ? (
          <p className="col-span-full text-sm text-muted-foreground">
            No synced platform data yet. Set DATABASE_URL and platform
            handles, then hit /api/sync to populate this page.
          </p>
        ) : (
          snapshots.map((snapshot) => (
            <PlatformCard key={snapshot.platform} snapshot={snapshot} />
          ))
        )}
      </section>
    </div>
  );
}
