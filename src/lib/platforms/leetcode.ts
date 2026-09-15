import type {
  ActivityDay,
  NormalizedProfile,
  PlatformAdapter,
  RatingPoint,
} from "./types";

const GRAPHQL_ENDPOINT = "https://leetcode.com/graphql";

// Unofficial, undocumented endpoint — schema can change without notice.
// Kept isolated behind this adapter so a breaking change only affects
// this file; see PRD §3 (LeetCode: unofficial, needs contract tests).
const QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
      }
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
      submissionCalendar
    }
    userContestRankingHistory(username: $username) {
      attended
      rating
      contest {
        title
        startTime
      }
    }
  }
`;

interface LeetCodeGraphQLResponse {
  data?: {
    matchedUser: {
      username: string;
      profile: { ranking: number | null };
      submitStats: {
        acSubmissionNum: { difficulty: string; count: number }[];
      };
      submissionCalendar: string;
    } | null;
    userContestRankingHistory:
      | {
          attended: boolean;
          rating: number;
          contest: { title: string; startTime: number };
        }[]
      | null;
  };
  errors?: { message: string }[];
}

async function fetchProfile(handle: string): Promise<NormalizedProfile> {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: QUERY,
      variables: { username: handle },
    }),
  });

  if (!res.ok) {
    throw new Error(`LeetCode API request failed: ${res.status}`);
  }

  const json = (await res.json()) as LeetCodeGraphQLResponse;
  if (json.errors?.length) {
    throw new Error(json.errors[0].message);
  }
  if (!json.data?.matchedUser) {
    throw new Error(`LeetCode user "${handle}" not found`);
  }

  const { matchedUser, userContestRankingHistory } = json.data;

  const totalSolved = matchedUser.submitStats.acSubmissionNum.find(
    (s) => s.difficulty === "All",
  )?.count;

  let activityCalendar: ActivityDay[] = [];
  try {
    const calendar = JSON.parse(matchedUser.submissionCalendar) as Record<
      string,
      number
    >;
    activityCalendar = Object.entries(calendar).map(
      ([unixSeconds, count]) => ({
        date: new Date(Number(unixSeconds) * 1000).toISOString().slice(0, 10),
        count,
      }),
    );
  } catch {
    activityCalendar = [];
  }

  const attended = (userContestRankingHistory ?? []).filter((c) => c.attended);
  const ratingHistory: RatingPoint[] = attended.map((c) => ({
    contestId: c.contest.title,
    contestName: c.contest.title,
    date: new Date(c.contest.startTime * 1000).toISOString(),
    rating: Math.round(c.rating),
  }));
  const latestRating = ratingHistory.at(-1)?.rating ?? null;
  const maxRating = ratingHistory.length
    ? Math.max(...ratingHistory.map((p) => p.rating))
    : null;

  return {
    platform: "leetcode",
    handle: matchedUser.username,
    profileUrl: `https://leetcode.com/${encodeURIComponent(matchedUser.username)}/`,
    currentRating: latestRating,
    maxRating,
    rank: matchedUser.profile.ranking
      ? `Rank ${matchedUser.profile.ranking}`
      : null,
    ratingHistory,
    activityCalendar,
    solvedCount: totalSolved ?? null,
    fetchedAt: new Date().toISOString(),
  };
}

export const leetcodeAdapter: PlatformAdapter = {
  platform: "leetcode",
  fetchProfile,
};
