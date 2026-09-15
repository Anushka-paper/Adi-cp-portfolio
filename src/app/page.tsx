import { ProfileCard } from "@/components/profile-card";
import { PlatformCard } from "@/components/platform-card";
import { RatingChart } from "@/components/rating-chart";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { getSnapshots } from "@/lib/get-snapshots";

export default async function Home() {
  const snapshots = await getSnapshots();

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-16 px-4 py-24">
      <ProfileCard
        name="Aditya"
        role="Competitive Programmer"
        email="aditya@example.com"
        statusText="Grinding rating"
        glowText="Codeforces Expert"
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
