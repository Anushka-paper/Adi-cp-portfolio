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
    const root = document.documentElement;

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

    // The View Transitions API snapshots the whole page (colors, text,
    // icons — everything) both before and after `commit()`, so the
    // circle we clip-path-animate is a real cross-fade of the entire
    // UI, not just a flat color — every component's colors change
    // together, in the same motion, with no separate per-element
    // transition to keep in sync.
    //
    // `.vt-dir-dark` / `.vt-dir-light` (globals.css) pick which
    // snapshot layer sits on top: going dark, the new (incoming) layer
    // is on top and its circle grows from the click point, revealing
    // it over the old layer. Going light, the old (outgoing) layer is
    // on top instead and its circle shrinks back down to the click
    // point, uncovering the new layer that's already fully painted
    // underneath — the requested spread-when-dark / shrink-when-light.
    root.classList.add(next ? "vt-dir-dark" : "vt-dir-light");

    const x = event.clientX;
    const y = event.clientY;

    animatingRef.current = true;
    const transition = document.startViewTransition(commit);

    transition.ready.then(() => {
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      );
      const clipPath = next
        ? [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
        : [`circle(${endRadius}px at ${x}px ${y}px)`, `circle(0px at ${x}px ${y}px)`];

      document.documentElement.animate(
        { clipPath },
        {
          duration: 500,
          easing: "ease-in-out",
          pseudoElement: next
            ? "::view-transition-new(root)"
            : "::view-transition-old(root)",
        },
      );
    });

    transition.finished.finally(() => {
      root.classList.remove("vt-dir-dark", "vt-dir-light");
      animatingRef.current = false;
    });
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
