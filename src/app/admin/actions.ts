"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { destroySession, hasValidSession } from "@/lib/admin-auth";
import { saveProfileContent } from "@/lib/profile-content";

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
    featuredItems: [],
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return "Saved.";
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
