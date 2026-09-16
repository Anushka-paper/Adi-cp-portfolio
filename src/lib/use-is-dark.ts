"use client";

import { useEffect, useState } from "react";

// Reflects whether <html> currently has the .dark class (see
// theme-toggle.tsx / layout.tsx's inline init script — this app
// dropped next-themes because Next.js 16 warns on its internal
// <script> rendering). Starts false to match a deterministic SSR
// output, then syncs to the real value on mount; not hydration-risky
// since callers use this only to drive dynamic chart rendering; not
// to branch server-rendered markup.
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const update = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
