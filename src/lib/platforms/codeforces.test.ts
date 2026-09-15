import { afterEach, describe, expect, it, vi } from "vitest";
import { codeforcesAdapter } from "./codeforces";

// Fixtures mirror the real Codeforces API shape at time of writing.
// If this test starts failing against a schema change, the live
// contract has drifted — see PRD §3 (nightly canary + contract tests).
const userInfoFixture = {
  status: "OK",
  result: [
    {
      handle: "tourist",
      rating: 3301,
      maxRating: 4009,
      rank: "legendary grandmaster",
      maxRank: "tourist",
    },
  ],
};

const ratingFixture = {
  status: "OK",
  result: [
    {
      contestId: 1,
      contestName: "Round 1",
      ratingUpdateTimeSeconds: 1600000000,
      newRating: 3000,
    },
  ],
};

const statusFixture = {
  status: "OK",
  result: [
    {
      verdict: "OK",
      creationTimeSeconds: 1600000000,
      problem: { contestId: 1, index: "A", name: "Problem A" },
    },
    {
      verdict: "WRONG_ANSWER",
      creationTimeSeconds: 1600000100,
      problem: { contestId: 1, index: "B", name: "Problem B" },
    },
  ],
};

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("codeforcesAdapter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes a Codeforces profile", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(userInfoFixture))
        .mockResolvedValueOnce(jsonResponse(ratingFixture))
        .mockResolvedValueOnce(jsonResponse(statusFixture)),
    );

    const profile = await codeforcesAdapter.fetchProfile("tourist");

    expect(profile.platform).toBe("codeforces");
    expect(profile.currentRating).toBe(3301);
    expect(profile.maxRating).toBe(4009);
    expect(profile.rank).toBe("legendary grandmaster");
    expect(profile.ratingHistory).toHaveLength(1);
    expect(profile.solvedCount).toBe(1); // only the OK verdict counts
    expect(profile.activityCalendar).toHaveLength(1);
    expect(profile.profileUrl).toBe("https://codeforces.com/profile/tourist");
  });

  it("throws when the API responds with a failure status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        jsonResponse({ status: "FAILED", comment: "handles: User not found" }),
      ),
    );

    await expect(
      codeforcesAdapter.fetchProfile("does-not-exist"),
    ).rejects.toThrow("User not found");
  });
});
