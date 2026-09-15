import { expect, test } from "@playwright/test";

test("home page renders the profile card and empty-state sections without crashing", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { name: "Aditya" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Rating history" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();

  // No DATABASE_URL in CI, so the page must degrade gracefully (PRD §1)
  // instead of throwing a full-page error.
  await expect(
    page.getByText("No synced platform data yet."),
  ).toBeVisible();
});

test("copy email button provides feedback", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  await page.getByRole("button", { name: "Copy Email" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
});
