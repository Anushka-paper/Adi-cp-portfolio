import { getDb } from "@/lib/db";
import { profileContent, type ProfileContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const SINGLETON_ID = "singleton";

export const DEFAULT_PROFILE_CONTENT = {
  name: "Aditya",
  role: "Competitive Programmer",
  bio: null as string | null,
  avatarUrl: "https://i.pravatar.cc/112",
  email: "aditya@example.com",
  socialLinks: {} as Record<string, string>,
  featuredItems: [] as { title: string; description: string; url: string }[],
};

export type ProfileContentData = typeof DEFAULT_PROFILE_CONTENT;

// Public pages fall back to defaults on any DB/config issue so a
// missing DATABASE_URL never produces a broken page (PRD §1).
export async function getProfileContent(): Promise<ProfileContentData> {
  if (!process.env.DATABASE_URL) {
    return DEFAULT_PROFILE_CONTENT;
  }
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(profileContent)
      .where(eq(profileContent.id, SINGLETON_ID));
    if (!row) return DEFAULT_PROFILE_CONTENT;
    return {
      name: row.name,
      role: row.role,
      bio: row.bio,
      avatarUrl: row.avatarUrl ?? DEFAULT_PROFILE_CONTENT.avatarUrl,
      email: row.email ?? DEFAULT_PROFILE_CONTENT.email,
      socialLinks: row.socialLinks ?? {},
      featuredItems: row.featuredItems ?? [],
    };
  } catch {
    return DEFAULT_PROFILE_CONTENT;
  }
}

export async function saveProfileContent(
  data: ProfileContentData,
): Promise<void> {
  const db = getDb();
  await db
    .insert(profileContent)
    .values({ id: SINGLETON_ID, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: profileContent.id,
      set: { ...data, updatedAt: new Date() },
    });
}

export type { ProfileContent };
