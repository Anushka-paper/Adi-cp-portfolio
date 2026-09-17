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

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit();
      return;
    }

    // Direction-dependent ripple behind the page content (rather than
    // the previous View Transitions clip-path reveal, which animates a
    // full-page screenshot and noticeably dropped frames on mobile):
    // going dark GROWS a circle of the new dark color out from the
    // click point; going light SHRINKS a circle of the old dark color
    // back down to the click point. The real theme now commits
    // immediately in both cases — every component's own colors fade
    // smoothly alongside the ripple via the `.theme-transitioning` CSS
    // class (globals.css) instead of snapping instantly, which looked
    // jarring once the ripple stopped painting over content.
    const outgoingColor = getComputedStyle(document.body).backgroundColor;

    // Adding the class and flipping the theme in the same tick would let
    // the browser coalesce both into one style recalc, with no "before"
    // frame to transition from — so nothing would actually animate.
    // Reading a layout property forces a synchronous reflow in between,
    // making sure `.theme-transitioning` is on record before the colors
    // it's meant to animate actually change.
    root.classList.add("theme-transitioning");
    void root.offsetHeight;
    commit();
    const incomingColor = getComputedStyle(document.body).backgroundColor;

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
    ripple.style.backgroundColor = next ? incomingColor : outgoingColor;
    ripple.style.transform = next ? "scale(0)" : "scale(1)";
    document.body.appendChild(ripple);

    animatingRef.current = true;
    const anim = ripple.animate(
      next
        ? [{ transform: "scale(0)" }, { transform: "scale(1)" }]
        : [{ transform: "scale(1)" }, { transform: "scale(0)" }],
      { duration: 420, easing: "cubic-bezier(0.4, 0, 0.2, 1)", fill: "forwards" },
    );
    anim.onfinish = () => {
      ripple.remove();
      root.classList.remove("theme-transitioning");
      animatingRef.current = false;
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
