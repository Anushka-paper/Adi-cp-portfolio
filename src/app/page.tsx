import { ProfileCard } from "@/components/profile-card";
import { PlatformCard } from "@/components/platform-card";
import { RatingChart } from "@/components/rating-chart";
import { ActivityHeatmap } from "@/components/activity-heatmap";
import { AchievementCard } from "@/components/achievement-card";
import { PlatformLinks } from "@/components/platform-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getSnapshots } from "@/lib/get-snapshots";
import { getProfileContent } from "@/lib/profile-content";
import { getPeakDisplay } from "@/lib/profile-display";

export default async function Home() {
  const [snapshots, content] = await Promise.all([
    getSnapshots(),
    getProfileContent(),
  ]);

  const codeforcesProfile = snapshots.find(
    (s) => s.platform === "codeforces",
  )?.data;
  const { accentColor, glowText } = getPeakDisplay(codeforcesProfile);

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center gap-8 px-4 py-16 sm:gap-12 sm:py-24 lg:max-w-6xl">
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
        glowText={glowText ?? "Codeforces Expert"}
        ctaText={content.ctaText}
        ctaUrl={content.ctaUrl}
      />

      {/* Only one of these two gets the glow-clearance top margin —
          whichever renders first right after the card — so it's never
          doubled up when platform links exist. */}
      {content.platformLinks.length > 0 && (
        <div className="mt-10">
          <PlatformLinks links={content.platformLinks} />
        </div>
      )}

      {/* Single column on mobile, 2 cols on tablet, a 12-col bento grid
          on desktop so tiles vary in size instead of stacking. Extra
          top margin clears the profile card's glow, which visually
          extends below the card itself (see profile-card.tsx's
          -bottom-10 glow slab) further than the flex gap accounts for. */}
      <div
        className={`grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 ${
          content.platformLinks.length === 0 ? "mt-10" : ""
        }`}
      >
        {snapshots.length === 0 ? (
          <p className="text-sm text-muted-foreground sm:col-span-2 lg:col-span-12">
            No synced platform data yet. Set DATABASE_URL and platform
            handles, then hit /api/sync to populate this page.
          </p>
        ) : (
          snapshots.map((snapshot) => (
            <div key={snapshot.platform} className="lg:col-span-4">
              <PlatformCard snapshot={snapshot} />
            </div>
          ))
        )}

        {/* No separate "Achievements" heading — these are styled
            identically to the platform cards above and just extend
            the same grid, rather than reading as a distinct section. */}
        {content.featuredItems.map((item) => (
          <div key={item.title} className="lg:col-span-4">
            <AchievementCard {...item} />
          </div>
        ))}

        <Card className="sm:col-span-2 lg:col-span-12">
          <CardHeader>
            {/* Not CardTitle — it renders a <div>, not a heading, and
                these are real page section headings. */}
            <h2 className="text-base leading-none font-semibold">
              Rating history
            </h2>
          </CardHeader>
          {/* min-w-0 overrides the flex item's default min-width:
              auto (Card is flex flex-col) — without it, CardContent
              grows to fit the chart's content instead of staying
              within the card, so the chart's own overflow-x-auto
              scrollbar never actually engages. */}
          <CardContent className="flex min-w-0 justify-center">
            <RatingChart snapshots={snapshots} />
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-12">
          <CardHeader>
            <h2 className="text-base leading-none font-semibold">
              Activity
            </h2>
          </CardHeader>
          <CardContent className="flex min-w-0 justify-center">
            <ActivityHeatmap snapshots={snapshots} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
