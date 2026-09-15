import { jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import type { NormalizedProfile, SyncStatus } from "@/lib/platforms/types";

// One row per platform, overwritten on every sync. Public pages read
// only from this table so a visitor request never depends on a live
// third-party call (see PRD §4 Architecture Overview).
export const platformSnapshots = pgTable("platform_snapshots", {
  platform: varchar("platform", { length: 32 }).primaryKey(),
  status: varchar("status", { length: 16 }).$type<SyncStatus>().notNull(),
  data: jsonb("data").$type<NormalizedProfile>(),
  error: text("error"),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).notNull(),
});

export type PlatformSnapshot = typeof platformSnapshots.$inferSelect;

// Owner-curated content — bio, avatar, links, pinned items. Editable
// without a redeploy (PRD Story 4).
export const profileContent = pgTable("profile_content", {
  id: varchar("id", { length: 16 }).primaryKey().default("singleton"),
  name: text("name").notNull(),
  role: text("role").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  socialLinks: jsonb("social_links").$type<Record<string, string>>(),
  featuredItems: jsonb("featured_items").$type<
    { title: string; description: string; url: string }[]
  >(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export type ProfileContent = typeof profileContent.$inferSelect;
