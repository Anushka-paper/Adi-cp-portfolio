import { afterEach, describe, expect, it, vi } from "vitest";
import { leetcodeAdapter } from "./leetcode";

// Fixture mirrors the unofficial LeetCode GraphQL response shape at
// time of writing — this is exactly the schema-drift risk called out
// in PRD §3, so a failing test here means the live contract changed.
const graphqlFixture = {
  data: {
    matchedUser: {
      username: "neal_wu",
      profile: { ranking: 634657 },
      submitStats: {
        acSubmissionNum: [
          { difficulty: "All", count: 253 },
          { difficulty: "Easy", count: 100 },
        ],
      },
      submissionCalendar: JSON.stringify({ 1600000000: 3 }),
    },
    userContestRankingHistory: [
      {
        attended: true,
        rating: 3628.123,
        contest: { title: "Weekly Contest 172", startTime: 1600000000 },
      },
      { attended: false, rating: 0, contest: { title: "Skipped", startTime: 0 } },
    ],
  },
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("leetcodeAdapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes a LeetCode profile", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(jsonResponse(graphqlFixture)),
    );

    const profile = await leetcodeAdapter.fetchProfile("neal_wu");

    expect(profile.platform).toBe("leetcode");
    expect(profile.solvedCount).toBe(253);
    expect(profile.rank).toBe("Rank 634657");
    expect(profile.ratingHistory).toHaveLength(1); // unattended contest excluded
    expect(profile.currentRating).toBe(3628);
    expect(profile.activityCalendar).toEqual([
      { date: new Date(1600000000 * 1000).toISOString().slice(0, 10), count: 3 },
    ]);
  });

  it("throws when the user is not found", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse({ data: { matchedUser: null } })),
    );

    await expect(
      leetcodeAdapter.fetchProfile("does-not-exist"),
    ).rejects.toThrow('LeetCode user "does-not-exist" not found');
  });
});
