"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroySession, hasValidSession } from "@/lib/admin-auth";
import { saveProfileContent } from "@/lib/profile-content";

const MAX_FEATURED_ITEMS = 6;

function parseFeaturedItems(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(
      (item): item is { title: string; description: string; url: string } =>
        typeof item === "object" &&
        item !== null &&
        typeof item.title === "string" &&
        typeof item.description === "string" &&
        typeof item.url === "string",
    )
    .map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
      url: item.url.trim(),
    }))
    .filter((item) => item.title.length > 0)
    .slice(0, MAX_FEATURED_ITEMS);
}

export async function updateProfile(_prevState: string | null, formData: FormData) {
  if (!(await hasValidSession())) {
    redirect("/admin/login");
  }

  await saveProfileContent({
    name: String(formData.get("name") ?? ""),
    role: String(formData.get("role") ?? ""),
    bio: String(formData.get("bio") ?? "") || null,
    avatarUrl: String(formData.get("avatarUrl") ?? ""),
    email: String(formData.get("email") ?? ""),
    socialLinks: {},
    featuredItems: parseFeaturedItems(formData.get("featuredItems")),
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return "Saved.";
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
