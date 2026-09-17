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

    // A ripple that spreads out from the click point to fully cover the
    // viewport, then contracts back down to nothing at the same point —
    // rather than the previous View Transitions clip-path reveal, which
    // animates a full-page screenshot and noticeably dropped frames on
    // mobile (tall pages make for a large snapshot to clip-path every
    // frame). This is a single small `<div>` animated purely via
    // `transform: scale(...)`, which the compositor can run smoothly
    // without any repaint of the underlying page.
    const x = event.clientX;
    const y = event.clientY;
    const newBg = getBackgroundColorForTheme(next);
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    const diameter = endRadius * 2;

    const ripple = document.createElement("div");
    ripple.style.position = "fixed";
    ripple.style.left = `${x - endRadius}px`;
    ripple.style.top = `${y - endRadius}px`;
    ripple.style.width = `${diameter}px`;
    ripple.style.height = `${diameter}px`;
    ripple.style.borderRadius = "9999px";
    ripple.style.backgroundColor = newBg;
    ripple.style.pointerEvents = "none";
    ripple.style.zIndex = "2147483647";
    ripple.style.transform = "scale(0)";
    ripple.style.willChange = "transform";
    document.body.appendChild(ripple);

    animatingRef.current = true;
    const spread = ripple.animate(
      [{ transform: "scale(0)" }, { transform: "scale(1)" }],
      { duration: 380, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
    );

    spread.onfinish = () => {
      // Flip the real theme now, while the ripple still fully covers
      // the screen at the same color — the swap itself is invisible.
      commit();
      const contract = ripple.animate(
        [{ transform: "scale(1)" }, { transform: "scale(0)" }],
        { duration: 380, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
      );
      contract.onfinish = () => {
        ripple.remove();
        animatingRef.current = false;
      };
    };
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
