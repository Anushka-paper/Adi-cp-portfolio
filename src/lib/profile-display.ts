import type { NormalizedProfile } from "@/lib/platforms/types";
import { getNeonRankColor } from "@/lib/codeforces-rank-color";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Shared by the home page and the OG image so they can't drift: both
// lead with the peak rating/rank (see platform-card.tsx), not
// whatever the rating happens to be today.
export function getPeakDisplay(
  codeforcesProfile: NormalizedProfile | null | undefined,
) {
  const peakRank = codeforcesProfile?.maxRank ?? codeforcesProfile?.rank;
  const accentColor = getNeonRankColor(
    codeforcesProfile?.maxRating ?? codeforcesProfile?.currentRating,
  );
  const glowText = peakRank ? `Codeforces ${capitalize(peakRank)}` : null;

  return { accentColor, glowText };
}
