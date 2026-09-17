"use client";

import { useActionState, useState } from "react";
import type { ProfileContentData } from "@/lib/profile-content";
import { updateProfile, uploadAvatar, resyncNow } from "./actions";

type FeaturedItem = { title: string; description: string; url: string };
const MAX_FEATURED_ITEMS = 6;
const EMPTY_ITEM: FeaturedItem = { title: "", description: "", url: "" };

type PlatformLink = { name: string; logoUrl: string; url: string };
const MAX_PLATFORM_LINKS = 8;
const EMPTY_PLATFORM_LINK: PlatformLink = { name: "", logoUrl: "", url: "" };

const inputClass =
  "w-full rounded-lg border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function AvatarUploader({ initialUrl }: { initialUrl: string }) {
  const [result, formAction, pending] = useActionState(uploadAvatar, null);
  const [avatarUrl, setAvatarUrl] = useState(initialUrl);

  const isSuccess = result != null && result.startsWith("http");
  if (isSuccess && result !== avatarUrl) {
    setAvatarUrl(result);
  }

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <label className="text-sm font-medium">Avatar</label>
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        {/* eslint-disable-next-line @next/next/no-img-element -- preview of an arbitrary uploaded/pasted URL */}
        <img
          src={avatarUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-border"
        />
        <form
          action={formAction}
          className="flex w-full flex-col gap-2 sm:flex-row sm:items-center"
        >
          <input
            type="file"
            name="avatarFile"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="min-w-0 flex-1 text-sm"
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

function ResyncButton() {
  const [result, action, pending] = useActionState(resyncNow, null);

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border p-3 sm:flex-row sm:items-center">
      <form action={action}>
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground disabled:opacity-60"
        >
          {pending ? "Syncing..." : "Resync now"}
        </button>
      </form>
      <p className="text-xs text-muted-foreground">
        {result ??
          "Pulls fresh data from Codeforces/LeetCode/AtCoder right now, instead of waiting for the daily cron."}
      </p>
    </div>
  );
}

export function AdminForm({ content }: { content: ProfileContentData }) {
  const [message, formAction, pending] = useActionState(updateProfile, null);
  const [items, setItems] = useState<FeaturedItem[]>(content.featuredItems);
  const [links, setLinks] = useState<PlatformLink[]>(content.platformLinks);

  function updateItem(index: number, patch: Partial<FeaturedItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateLink(index: number, patch: Partial<PlatformLink>) {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, ...patch } : link)),
    );
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <ResyncButton />
      <AvatarUploader initialUrl={content.avatarUrl} />

      <form id="profile-form" action={formAction}>
        {/* Single column on mobile/tablet, two columns on desktop:
            profile fields on the left, curated lists on the right —
            instead of one long single-column stack regardless of
            screen width. */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  defaultValue={content.name}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Role
                </label>
                <input
                  id="role"
                  name="role"
                  defaultValue={content.role}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <input
                id="bio"
                name="bio"
                defaultValue={content.bio ?? ""}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                defaultValue={content.email}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="ctaText" className="text-sm font-medium">
                  First button text (e.g. &quot;Hire Me&quot;)
                </label>
                <input
                  id="ctaText"
                  name="ctaText"
                  defaultValue={content.ctaText}
                  className={inputClass}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="ctaUrl" className="text-sm font-medium">
                  First button link
                </label>
                <input
                  id="ctaUrl"
                  name="ctaUrl"
                  defaultValue={content.ctaUrl}
                  className={inputClass}
                />
              </div>
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
          </div>

          <div className="space-y-6">
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
                <div key={index} className="space-y-2 rounded-lg border p-3">
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
                    className={inputClass}
                  />
                  <input
                    placeholder="Description (e.g. Rating 1847)"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, { description: e.target.value })
                    }
                    className={inputClass}
                  />
                  <input
                    placeholder="Link (optional)"
                    value={item.url}
                    onChange={(e) => updateItem(index, { url: e.target.value })}
                    className={inputClass}
                  />
                </div>
              ))}

              <input
                type="hidden"
                name="featuredItems"
                value={JSON.stringify(items)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">
                  Platform Links ({links.length}/{MAX_PLATFORM_LINKS})
                </h2>
                <button
                  type="button"
                  disabled={links.length >= MAX_PLATFORM_LINKS}
                  onClick={() =>
                    setLinks((prev) => [...prev, { ...EMPTY_PLATFORM_LINK }])
                  }
                  className="text-sm font-medium underline underline-offset-4 disabled:opacity-40 disabled:no-underline"
                >
                  + Add
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Circular logo icons linking out to your profile on each platform
                — click the circle on the home page to open the link.
              </p>

              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-start"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- preview of an admin-supplied arbitrary logo URL */}
                  <img
                    src={link.logoUrl || "https://placehold.co/40"}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border sm:mt-0.5"
                  />
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Link {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="text-xs font-medium text-destructive underline underline-offset-4"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      placeholder="Name (e.g. Codeforces)"
                      value={link.name}
                      onChange={(e) => updateLink(index, { name: e.target.value })}
                      className={inputClass}
                    />
                    <input
                      placeholder="Logo image URL"
                      value={link.logoUrl}
                      onChange={(e) =>
                        updateLink(index, { logoUrl: e.target.value })
                      }
                      className={inputClass}
                    />
                    <input
                      placeholder="Link URL"
                      value={link.url}
                      onChange={(e) => updateLink(index, { url: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
              ))}

              <input
                type="hidden"
                name="platformLinks"
                value={JSON.stringify(links)}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
