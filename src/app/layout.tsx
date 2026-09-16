import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Needed so the opengraph-image.tsx file convention (and any other
  // relative URLs in metadata) resolve to an absolute, real URL
  // instead of defaulting to http://localhost:3000 in share previews.
  // VERCEL_PROJECT_PRODUCTION_URL is the stable production domain
  // (unlike VERCEL_URL, which is a new value per-deployment).
  metadataBase: new URL(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000",
  ),
  title: "CP Portfolio",
  description: "Competitive programming profile portfolio",
};

// Resolves the theme (localStorage, falling back to system preference)
// and applies .dark/.light to <html> synchronously during HTML
// parsing, before React hydrates — replaces next-themes, whose own
// internal <script> rendering Next.js 16 now warns/errors on (see
// next/dist/docs/.../preventing-flash-before-hydration.md). The
// type="text/plain" trick on the client keeps React from complaining
// about a <script> tag on re-renders; it only needs to actually run
// once, during the initial HTML parse.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);document.documentElement.classList.toggle("light",!d)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
