import { atcoderAdapter } from "./atcoder";
import { codeforcesAdapter } from "./codeforces";
import { leetcodeAdapter } from "./leetcode";
import type { Platform, PlatformAdapter } from "./types";

export const adapters: Record<Platform, PlatformAdapter | null> = {
  codeforces: codeforcesAdapter,
  leetcode: leetcodeAdapter,
  atcoder: atcoderAdapter,
  codechef: null, // no public API — see progress-tracker.md for the plan
};

export * from "./types";
