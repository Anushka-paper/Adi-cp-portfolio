"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AvatarGroup, AvatarGroupTooltip } from "@/components/ui/avatar-group";

interface PlatformLink {
  name: string;
  logoUrl: string;
  url: string;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

// Circular logo icons for each platform profile, admin-managed via
// /admin (name, logo, link). Clicking a circle opens that platform's
// profile in a new tab.
//
// Navigation is a click handler on the Avatar rather than a real <a>
// wrapper: AvatarGroup's tooltip trigger renders as a <button>
// internally, and nesting an anchor inside a button is invalid HTML
// (interactive content inside interactive content) — browsers
// "correct" that at parse time, which produces exactly a
// server/client DOM mismatch. Trade-off: keyboard/click work, but
// right-click "open in new tab" and middle-click don't, since there's
// no real href.
export function PlatformLinks({ links }: { links: PlatformLink[] }) {
  if (links.length === 0) return null;

  return (
    <AvatarGroup className="h-12 -space-x-3">
      {links.map((link) => (
        <Avatar
          key={link.name}
          className="size-12 cursor-pointer border-3 border-background"
          role="link"
          aria-label={link.name}
          onClick={() => window.open(link.url, "_blank", "noopener,noreferrer")}
        >
          <AvatarImage src={link.logoUrl} alt="" />
          <AvatarFallback>{initials(link.name)}</AvatarFallback>
          <AvatarGroupTooltip>
            <p>{link.name}</p>
          </AvatarGroupTooltip>
        </Avatar>
      ))}
    </AvatarGroup>
  );
}
