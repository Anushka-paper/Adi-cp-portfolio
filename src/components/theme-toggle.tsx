"use client";

import { useLayoutEffect } from "react";
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

export function ThemeToggle() {
  // React's Strict Mode remounts once in dev, resetting <html> to only
  // the attributes/classes it manages from JSX — this re-applies
  // whatever the layout's inline script already set. No-op in
  // production. See preventing-flash-before-hydration.md.
  useLayoutEffect(() => {
    applyTheme(resolveIsDark());
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = !resolveIsDark();
    const x = event.clientX;
    const y = event.clientY;

    function commit() {
      applyTheme(next);
      try {
        localStorage.setItem("theme", next ? "dark" : "light");
      } catch {
        // localStorage unavailable (private browsing, etc.) — the class
        // still toggles for this page view, just won't persist.
      }
    }

    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      commit();
      return;
    }

    const transition = document.startViewTransition(commit);
    transition.ready.then(() => {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${endRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
