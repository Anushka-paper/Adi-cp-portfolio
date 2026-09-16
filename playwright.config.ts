import { defineConfig } from "@playwright/test";

const PORT = 3900;

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    // Explicitly override anything loaded from a developer's own
    // .env.local so the smoke test's "no DB configured" assumption
    // stays true regardless of what's set up locally.
    env: { DATABASE_URL: "" },
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
});
