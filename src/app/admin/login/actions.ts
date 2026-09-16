"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession } from "@/lib/admin-auth";

export async function login(_prevState: string | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!checkPassword(password)) {
    return "Incorrect password.";
  }

  try {
    await createSession();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `Login succeeded but session creation failed: ${message}`;
  }

  redirect("/admin");
}
