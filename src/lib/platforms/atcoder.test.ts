import { afterEach, describe, expect, it, vi } from "vitest";
import { atcoderAdapter } from "./atcoder";

// Fixture mirrors atcoder.jp/users/<user>/history/json — undocumented
// but stable in practice; a failing test here signals real drift.
const historyFixture = [
  {
    IsRated: true,
    NewRating: 800,
    ContestName: "AtCoder Beginner Contest 100",
    ContestScreenName: "abc100.contest.atcoder.jp",
    EndTime: "2020-01-01T22:40:00+09:00",
  },
  { IsRated: false, NewRating: 0, ContestName: "Unrated", ContestScreenName: "x", EndTime: "2020-01-02T00:00:00+09:00" },
  {
    IsRated: true,
    NewRating: 2100,
    ContestName: "AtCoder Beginner Contest 101",
    ContestScreenName: "abc101.contest.atcoder.jp",
    EndTime: "2020-02-01T22:40:00+09:00",
  },
  {
    // Rating dropped after the peak — current and max should diverge,
    // including their rank tiers (yellow vs cyan).
    IsRated: true,
    NewRating: 1250,
    ContestName: "AtCoder Beginner Contest 102",
    ContestScreenName: "abc102.contest.atcoder.jp",
    EndTime: "2020-03-01T22:40:00+09:00",
  },
];

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("atcoderAdapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes an AtCoder profile", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(historyFixture))
        .mockResolvedValueOnce(jsonResponse({ count: 500, rank: 1000 })),
    );

    const profile = await atcoderAdapter.fetchProfile("someuser");

    expect(profile.platform).toBe("atcoder");
    expect(profile.ratingHistory).toHaveLength(3); // unrated entry excluded
    expect(profile.currentRating).toBe(1250);
    expect(profile.maxRating).toBe(2100);
    expect(profile.rank).toBe("cyan"); // current 1250 falls in the cyan tier
    expect(profile.maxRank).toBe("yellow"); // peak 2100 falls in the yellow tier
    expect(profile.solvedCount).toBe(500);
  });

  it("throws when the user has no history", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(jsonResponse([])));

    await expect(
      atcoderAdapter.fetchProfile("does-not-exist"),
    ).rejects.toThrow('no contest history');
  });
});
