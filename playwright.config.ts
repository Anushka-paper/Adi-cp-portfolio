import { defineConfig } from "@playwright/test";

const PORT = 3900;

export default defineConfig({
  testDir: "./e2e",
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
});
