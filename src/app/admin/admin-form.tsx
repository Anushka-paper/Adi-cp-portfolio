"use client";

import { useActionState } from "react";
import type { ProfileContentData } from "@/lib/profile-content";
import { updateProfile, logout } from "./actions";

type TextField = "name" | "role" | "bio" | "avatarUrl" | "email";

const fields: { name: TextField; label: string; type?: string }[] = [
  { name: "name", label: "Name" },
  { name: "role", label: "Role" },
  { name: "bio", label: "Bio" },
  { name: "avatarUrl", label: "Avatar URL" },
  { name: "email", label: "Email" },
];

export function AdminForm({ content }: { content: ProfileContentData }) {
  const [message, formAction, pending] = useActionState(updateProfile, null);

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
            </label>
            <input
              id={field.name}
              name={field.name}
              type={field.type ?? "text"}
              defaultValue={content[field.name] ?? ""}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        ))}
        {message && (
          <p role="status" className="text-sm text-muted-foreground">
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {pending ? "Saving..." : "Save"}
        </button>
      </form>
      <form action={logout}>
        <button
          type="submit"
          className="text-sm font-medium underline underline-offset-4"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
