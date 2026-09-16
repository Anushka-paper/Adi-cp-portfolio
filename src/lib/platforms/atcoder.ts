import type {
  ActivityDay,
  NormalizedProfile,
  PlatformAdapter,
  RatingPoint,
} from "./types";

interface AtCoderHistoryEntry {
  IsRated: boolean;
  NewRating: number;
  ContestName: string;
  ContestScreenName: string;
  EndTime: string; // ISO 8601 with a +09:00 offset
}

interface KenkoooAcRank {
  count: number;
  rank: number;
}

// AtCoder's color-tiered ranks, by rating threshold — there's no API
// field for this, it's purely derived the same way the site colors
// user names (see PRD §3: community-dataset-backed, verify caching
// etiquette rather than hammering the site directly for this).
const RANK_TIERS: { minRating: number; rank: string }[] = [
  { minRating: 2800, rank: "red" },
  { minRating: 2400, rank: "orange" },
  { minRating: 2000, rank: "yellow" },
  { minRating: 1600, rank: "blue" },
  { minRating: 1200, rank: "cyan" },
  { minRating: 800, rank: "green" },
  { minRating: 400, rank: "brown" },
  { minRating: 0, rank: "gray" },
];

function rankFor(rating: number): string {
  return RANK_TIERS.find((tier) => rating >= tier.minRating)?.rank ?? "gray";
}

async function fetchProfile(handle: string): Promise<NormalizedProfile> {
  const historyRes = await fetch(
    `https://atcoder.jp/users/${encodeURIComponent(handle)}/history/json`,
  );
  if (!historyRes.ok) {
    throw new Error(`AtCoder history request failed: ${historyRes.status}`);
  }
  const history = (await historyRes.json()) as AtCoderHistoryEntry[];
  if (history.length === 0) {
    throw new Error(`AtCoder user "${handle}" has no contest history`);
  }

  const rated = history.filter((entry) => entry.IsRated);
  const ratingHistory: RatingPoint[] = rated.map((entry) => ({
    contestId: entry.ContestScreenName,
    contestName: entry.ContestName,
    date: new Date(entry.EndTime).toISOString(),
    rating: entry.NewRating,
  }));

  const currentRating = ratingHistory.at(-1)?.rating ?? null;
  const maxRating = ratingHistory.length
    ? Math.max(...ratingHistory.map((p) => p.rating))
    : null;

  // Best-effort — the community dataset can be briefly behind AtCoder
  // itself, and a user might not appear in it at all yet.
  const acRank = await fetch(
    `https://kenkoooo.com/atcoder/atcoder-api/v3/user/ac_rank?user=${encodeURIComponent(handle)}`,
  )
    .then((res) => (res.ok ? (res.json() as Promise<KenkoooAcRank>) : null))
    .catch(() => null);

  // AtCoder Problems (kenkoooo) doesn't expose a per-day submission
  // calendar the way CF/LeetCode do, so this stays empty for now.
  const activityCalendar: ActivityDay[] = [];

  return {
    platform: "atcoder",
    handle,
    profileUrl: `https://atcoder.jp/users/${encodeURIComponent(handle)}`,
    currentRating,
    maxRating,
    rank: currentRating != null ? rankFor(currentRating) : null,
    ratingHistory,
    activityCalendar,
    solvedCount: acRank?.count ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

export const atcoderAdapter: PlatformAdapter = {
  platform: "atcoder",
  fetchProfile,
};
