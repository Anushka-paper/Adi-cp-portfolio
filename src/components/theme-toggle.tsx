"use client";

import { useLayoutEffect, useRef } from "react";
import { Moon, Sun } from "lucide-react";

function resolveIsDark(): boolean {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark") return true;
    if (stored === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function applyTheme(isDark: boolean) {
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.classList.toggle("light", !isDark);
}

// Reads the real computed background color for a theme without ever
// painting it: flips the class, reads, flips back — all synchronous,
// so it never reaches the screen. Avoids hardcoding the --background
// oklch values here in a second place (globals.css already owns them).
function getBackgroundColorForTheme(isDark: boolean): string {
  const root = document.documentElement;
  const hadDark = root.classList.contains("dark");
  const hadLight = root.classList.contains("light");
  root.classList.toggle("dark", isDark);
  root.classList.toggle("light", !isDark);
  const color = getComputedStyle(document.body).backgroundColor;
  root.classList.toggle("dark", hadDark);
  root.classList.toggle("light", hadLight);
  return color;
}

export function ThemeToggle() {
  // React's Strict Mode remounts once in dev, resetting <html> to only
  // the attributes/classes it manages from JSX — this re-applies
  // whatever the layout's inline script already set. No-op in
  // production. See preventing-flash-before-hydration.md.
  useLayoutEffect(() => {
    applyTheme(resolveIsDark());
  }, []);

  const animatingRef = useRef(false);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    if (animatingRef.current) return;

    const next = !resolveIsDark();

    function commit() {
      applyTheme(next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // localStorage unavailable (private browsing, etc.) — the class
        // still toggles for this page view, just won't persist.
      }
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit();
      return;
    }

    // Direction-dependent single-phase ripple, rather than the previous
    // View Transitions clip-path reveal (which animates a full-page
    // screenshot and noticeably dropped frames on mobile — tall pages
    // make for a large snapshot to clip-path every frame). This is a
    // small `<div>` animated purely via `transform: scale(...)`, which
    // the compositor can run smoothly without repainting the page:
    // going dark GROWS a circle of the incoming dark color out from the
    // click point (spread); going light SHRINKS a circle of the
    // outgoing dark color back down to the click point (contract),
    // uncovering the already-switched light page as it recedes.
    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const diameter = endRadius * 2;

    // z-index: -1 keeps this behind every normal (non-positioned) page
    // element — cards, buttons, text all stay fully visible throughout
    // the animation instead of being covered by it. The ripple only
    // shows up through the page's own background, not over content.
    const ripple = document.createElement("div");
    ripple.style.position = "fixed";
    ripple.style.left = `${x - endRadius}px`;
    ripple.style.top = `${y - endRadius}px`;
    ripple.style.width = `${diameter}px`;
    ripple.style.height = `${diameter}px`;
    ripple.style.borderRadius = "9999px";
    ripple.style.pointerEvents = "none";
    ripple.style.zIndex = "-1";
    ripple.style.willChange = "transform";

    animatingRef.current = true;

    if (next) {
      // Going dark: grow a dark circle from nothing, then commit once
      // it fully covers the screen — the swap is invisible since the
      // ripple already matches the real background at that instant.
      ripple.style.backgroundColor = getBackgroundColorForTheme(true);
      ripple.style.transform = "scale(0)";
      document.body.appendChild(ripple);

      const spread = ripple.animate(
        [{ transform: "scale(0)" }, { transform: "scale(1)" }],
        { duration: 420, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
      );
      spread.onfinish = () => {
        commit();
        ripple.remove();
        animatingRef.current = false;
      };
    } else {
      // Going light: commit immediately behind a circle already covering
      // the screen in the outgoing dark color, then shrink that circle
      // back down to the click point — revealing the real (now light)
      // page underneath as it recedes.
      ripple.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
      ripple.style.transform = "scale(1)";
      document.body.appendChild(ripple);
      commit();

      const contract = ripple.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0)" }],
        { duration: 420, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
      );
      contract.onfinish = () => {
        ripple.remove();
        animatingRef.current = false;
      };
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background text-foreground shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Both icons always render — visibility is pure CSS keyed off
          the .dark class the layout's inline script already applied
          before hydration, so server and client markup always match
          (no conditional JSX branch based on client-only state). */}
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}
