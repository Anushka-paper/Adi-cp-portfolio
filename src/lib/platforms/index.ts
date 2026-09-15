import { codeforcesAdapter } from "./codeforces";
import { leetcodeAdapter } from "./leetcode";
import type { Platform, PlatformAdapter } from "./types";

export const adapters: Record<Platform, PlatformAdapter | null> = {
  codeforces: codeforcesAdapter,
  leetcode: leetcodeAdapter,
  atcoder: null, // planned for v1.1 — see PRD §5
  codechef: null, // planned for v1.1 — see PRD §5
};

export * from "./types";
