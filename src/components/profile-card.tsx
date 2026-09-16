"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Clock, Copy, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { hexToRgba } from "@/lib/codeforces-rank-color";

export interface ProfileCardProps {
  name?: string;
  role?: string;
  email?: string;
  avatarSrc?: string;
  statusText?: string;
  /** Hex color driving the glow slab and status dot — the design's
   * single accent (see design.md §2.1). Defaults to the original lime. */
  accentColor?: string;
  glowText?: string;
  /** Text and destination for the card's first action button — was a
   * hardcoded "Hire Me" with no link. */
  ctaText?: string;
  ctaUrl?: string;
  className?: string;
}

export function ProfileCard({
  name = "Berat Berkay",
  role = "Developer",
  email = "hello@example.com",
  avatarSrc = "https://i.pravatar.cc/112",
  statusText = "Available for work",
  accentColor = "#a3e635",
  glowText = "Currently High on Creativity",
  ctaText = "Hire Me",
  ctaUrl = "",
  className,
}: ProfileCardProps) {
  const [copied, setCopied] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // null on the server and until the first client effect runs, so the
  // initial client render matches the server's HTML exactly (avoids a
  // hydration mismatch). The home page is statically prerendered, so
  // the server's clock is frozen at build time — computing this
  // eagerly during render would mismatch the client's real time on
  // essentially every page load, not just occasionally.
  const [timeText, setTimeText] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      setTimeText(
        new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      );
    }
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable — no-op fallback
    }
  }

  return (
    <div className={cn("relative w-full max-w-3xl", className)}>
      {/* Glow slab */}
      <div
        className="absolute inset-x-6 top-[72%] -bottom-10 z-0 rounded-[28px]"
        style={{
          backgroundColor: hexToRgba(accentColor, 0.9),
          boxShadow: `0 40px 80px -16px ${hexToRgba(accentColor, 0.8)}`,
        }}
        aria-hidden
      >
        <div className="flex h-full items-end justify-center pb-4">
          <span className="text-sm font-medium text-black">{glowText}</span>
        </div>
      </div>

      {/* Card */}
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 rounded-[28px] p-6 shadow-2xl sm:p-8"
        style={{
          background:
            "radial-gradient(120% 120% at 30% 10%, #1a1a1a 0%, #0f0f10 60%, #0b0b0c 100%)",
        }}
      >
        {/* Status row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: accentColor }}
            />
            <span className="select-none text-sm text-neutral-300">
              {statusText}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-300" />
            <span className="tabular-nums text-sm text-neutral-300">
              {timeText ?? "--:--"}
            </span>
          </div>
        </div>

        {/* Identity block */}
        <div className="flex flex-wrap items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element -- avatarSrc is an admin-editable arbitrary URL, not a known-domain asset */}
          <img
            src={avatarSrc}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10"
          />
          <div>
            <h3 className="truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {name}
            </h3>
            <p className="mt-0.5 text-sm text-neutral-400">{role}</p>
          </div>
        </div>

        {/* Action row */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ctaUrl ? (
            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener"
              className="flex h-12 items-center justify-start gap-2 rounded-2xl bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              {ctaText}
            </a>
          ) : (
            // No link configured yet (via /admin) — same look, not
            // interactive, so the layout doesn't shift once one is set.
            <span className="flex h-12 items-center justify-start gap-2 rounded-2xl bg-white/10 px-4 text-sm font-medium text-white/60">
              <Plus className="h-4 w-4" />
              {ctaText}
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="flex h-12 items-center justify-start gap-2 rounded-2xl bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy Email"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
