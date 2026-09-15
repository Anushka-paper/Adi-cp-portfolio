"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession } from "@/lib/admin-auth";

export async function login(_prevState: string | null, formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!checkPassword(password)) {
    return "Incorrect password.";
  }

  await createSession();
  redirect("/admin");
}
