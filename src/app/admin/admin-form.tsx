"use client";

import { useActionState, useState } from "react";
import type { ProfileContentData } from "@/lib/profile-content";
import { updateProfile, uploadAvatar, logout } from "./actions";

type TextField = "name" | "role" | "bio" | "email";

const fields: { name: TextField; label: string; type?: string }[] = [
  { name: "name", label: "Name" },
  { name: "role", label: "Role" },
  { name: "bio", label: "Bio" },
  { name: "email", label: "Email" },
];

type FeaturedItem = { title: string; description: string; url: string };
const MAX_FEATURED_ITEMS = 6;
const EMPTY_ITEM: FeaturedItem = { title: "", description: "", url: "" };

function AvatarUploader({ initialUrl }: { initialUrl: string }) {
  const [result, formAction, pending] = useActionState(uploadAvatar, null);
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);

  const isSuccess = result != null && result.startsWith("http");
  if (isSuccess && result !== avatarUrl) {
    setAvatarUrl(result);
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Avatar</label>
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary uploaded/pasted URL */}
        <img
          src={avatarUrl}
          alt=""
          className="h-14 w-14 rounded-full object-cover ring-1 ring-border"
        />
        <form action={formAction} className="flex flex-1 items-center gap-2">
          <input
            type="file"
            name="avatarFile"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="flex-1 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground disabled:opacity-60"
          >
            {pending ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
      {result && !isSuccess && (
        <p role="alert" className="text-sm text-destructive">
          {result}
        </p>
      )}
      {isSuccess && <p className="text-xs text-muted-foreground">Uploaded and saved.</p>}
      <input type="hidden" name="avatarUrl" value={avatarUrl} form="profile-form" />
    </div>
  );
}

export function AdminForm({ content }: { content: ProfileContentData }) {
  const [message, formAction, pending] = useActionState(updateProfile, null);
  const [items, setItems] = useState<FeaturedItem[]>(content.featuredItems);

  function updateItem(index: number, patch: Partial<FeaturedItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <AvatarUploader initialUrl={content.avatarUrl} />

      <form id="profile-form" action={formAction} className="space-y-8">
        <div className="space-y-4">
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
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">
              Achievements ({items.length}/{MAX_FEATURED_ITEMS})
            </h2>
            <button
              type="button"
              disabled={items.length >= MAX_FEATURED_ITEMS}
              onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
              className="text-sm font-medium underline underline-offset-4 disabled:opacity-40 disabled:no-underline"
            >
              + Add
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            For platforms without live syncing (CodeChef, CSES, ICPC, etc.) —
            e.g. &quot;CodeChef 4★&quot; or &quot;ICPC Regionalist 2025&quot;.
          </p>

          {items.map((item, index) => (
            <div
              key={index}
              className="space-y-2 rounded-lg border p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Item {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-xs font-medium text-destructive underline underline-offset-4"
                >
                  Remove
                </button>
              </div>
              <input
                placeholder="Title (e.g. CodeChef 4★)"
                value={item.title}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <input
                placeholder="Description (e.g. Rating 1847)"
                value={item.description}
                onChange={(e) =>
                  updateItem(index, { description: e.target.value })
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <input
                placeholder="Link (optional)"
                value={item.url}
                onChange={(e) => updateItem(index, { url: e.target.value })}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          ))}

          <input type="hidden" name="featuredItems" value={JSON.stringify(items)} />
        </div>

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
