import type { NormalizedProfile, PlatformAdapter, RatingPoint } from "./types";

interface CFUserInfo {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
}

interface CFRatingChange {
  contestId: number;
  contestName: string;
  ratingUpdateTimeSeconds: number;
  newRating: number;
}

interface CFSubmission {
  verdict?: string;
  problem: { contestId?: number; index: string; name: string };
}

interface CFResponse<T> {
  status: "OK" | "FAILED";
  result?: T;
  comment?: string;
}

const API_BASE = "https://codeforces.com/api";

async function cfGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Codeforces API request failed: ${res.status}`);
  }
  const json = (await res.json()) as CFResponse<T>;
  if (json.status !== "OK" || !json.result) {
    throw new Error(json.comment ?? "Codeforces API returned a failure status");
  }
  return json.result;
}

async function fetchProfile(handle: string): Promise<NormalizedProfile> {
  const [userInfo] = await cfGet<CFUserInfo[]>(
    `/user.info?handles=${encodeURIComponent(handle)}`,
  );
  const ratingChanges = await cfGet<CFRatingChange[]>(
    `/user.rating?handle=${encodeURIComponent(handle)}`,
  );
  const submissions = await cfGet<CFSubmission[]>(
    `/user.status?handle=${encodeURIComponent(handle)}`,
  ).catch(() => [] as CFSubmission[]);

  const solvedProblems = new Set(
    submissions
      .filter((s) => s.verdict === "OK")
      .map((s) => `${s.problem.contestId ?? ""}${s.problem.index}`),
  );

  const ratingHistory: RatingPoint[] = ratingChanges.map((change) => ({
    contestId: String(change.contestId),
    contestName: change.contestName,
    date: new Date(change.ratingUpdateTimeSeconds * 1000).toISOString(),
    rating: change.newRating,
  }));

  return {
    platform: "codeforces",
    handle: userInfo.handle,
    profileUrl: `https://codeforces.com/profile/${encodeURIComponent(userInfo.handle)}`,
    currentRating: userInfo.rating ?? null,
    maxRating: userInfo.maxRating ?? null,
    rank: userInfo.rank ?? null,
    ratingHistory,
    solvedCount: solvedProblems.size,
    fetchedAt: new Date().toISOString(),
  };
}

export const codeforcesAdapter: PlatformAdapter = {
  platform: "codeforces",
  fetchProfile,
};
