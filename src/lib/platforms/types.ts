export type Platform = "codeforces" | "leetcode" | "atcoder" | "codechef";

export interface RatingPoint {
  contestId: string;
  contestName: string;
  date: string; // ISO 8601
  rating: number;
}

export interface ActivityDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface NormalizedProfile {
  platform: Platform;
  handle: string;
  profileUrl: string;
  currentRating: number | null;
  maxRating: number | null;
  rank: string | null;
  ratingHistory: RatingPoint[];
  activityCalendar: ActivityDay[];
  solvedCount: number | null;
  fetchedAt: string; // ISO 8601
}

export type SyncStatus = "ok" | "stale" | "failed";

export interface SyncResult {
  platform: Platform;
  status: SyncStatus;
  profile: NormalizedProfile | null;
  error?: string;
}

export interface PlatformAdapter {
  platform: Platform;
  fetchProfile(handle: string): Promise<NormalizedProfile>;
}
