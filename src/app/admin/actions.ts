"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroySession, hasValidSession } from "@/lib/admin-auth";
import { getProfileContent, saveProfileContent } from "@/lib/profile-content";
import { runSync } from "@/lib/sync";

const MAX_AVATAR_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

const MAX_FEATURED_ITEMS = 6;
const MAX_PLATFORM_LINKS = 8;

function parseJsonArray(raw: FormDataEntryValue | null): unknown[] {
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseFeaturedItems(raw: FormDataEntryValue | null) {
  return parseJsonArray(raw)
    .filter(
      (item): item is { title: string; description: string; url: string } =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).title === "string" &&
        typeof (item as Record<string, unknown>).description === "string" &&
        typeof (item as Record<string, unknown>).url === "string",
    )
    .map((item) => ({
      title: item.title.trim(),
      description: item.description.trim(),
      url: item.url.trim(),
    }))
    .filter((item) => item.title.length > 0)
    .slice(0, MAX_FEATURED_ITEMS);
}

function parsePlatformLinks(raw: FormDataEntryValue | null) {
  return parseJsonArray(raw)
    .filter(
      (item): item is { name: string; logoUrl: string; url: string } =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as Record<string, unknown>).name === "string" &&
        typeof (item as Record<string, unknown>).logoUrl === "string" &&
        typeof (item as Record<string, unknown>).url === "string",
    )
    .map((item) => ({
      name: item.name.trim(),
      logoUrl: item.logoUrl.trim(),
      url: item.url.trim(),
    }))
    .filter((item) => item.name.length > 0 && item.url.length > 0)
    .slice(0, MAX_PLATFORM_LINKS);
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
    platformLinks: parsePlatformLinks(formData.get("platformLinks")),
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return "Saved.";
}

export async function uploadAvatar(_prevState: string | null, formData: FormData) {
  if (!(await hasValidSession())) {
    redirect("/admin/login");
  }

  const file = formData.get("avatarFile");
  if (!(file instanceof File) || file.size === 0) {
    return "No file selected.";
  }
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    return "Unsupported file type — use PNG, JPEG, WebP, or GIF.";
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return "File too large — 5MB max.";
  }

  let url: string;
  try {
    const blob = await put(`avatars/${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    url = blob.url;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Upload failed: ${message}`;
  }

  const current = await getProfileContent();
  await saveProfileContent({ ...current, avatarUrl: url });

  revalidatePath("/");
  revalidatePath("/admin");
  return url;
}

export async function resyncNow() {
  if (!(await hasValidSession())) {
    redirect("/admin/login");
  }

  try {
    const outcome = await runSync();
    const summary = outcome.results
      .map((r) => `${r.platform}: ${r.status}`)
      .join(", ");
    revalidatePath("/admin");
    return summary
      ? `Synced at ${new Date(outcome.syncedAt).toLocaleTimeString()} — ${summary}`
      : "No platform handles configured — nothing to sync.";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Sync failed: ${message}`;
  }
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
