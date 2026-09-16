// Neon analogues of Codeforces' own rank colors (gray/green/cyan/blue/
// purple/orange/red), tuned to sit well against the profile card's
// dark surface instead of CF's muted site-theme tones.
const RANK_COLORS: { minRating: number; color: string }[] = [
  { minRating: 3000, color: "#ff1744" }, // legendary grandmaster
  { minRating: 2600, color: "#ff2e2e" }, // international grandmaster
  { minRating: 2400, color: "#ff073a" }, // grandmaster
  { minRating: 2300, color: "#ff9f1c" }, // international master
  { minRating: 2100, color: "#ff6600" }, // master
  { minRating: 1900, color: "#d400ff" }, // candidate master
  { minRating: 1600, color: "#1f8fff" }, // expert
  { minRating: 1400, color: "#00e5ff" }, // specialist
  { minRating: 1200, color: "#39ff14" }, // pupil
  { minRating: 0, color: "#d0d0d0" }, // newbie
];

const DEFAULT_COLOR = "#a3e635"; // lime — used when no rating is known yet

export function getNeonRankColor(rating: number | null | undefined): string {
  if (rating == null) return DEFAULT_COLOR;
  return (
    RANK_COLORS.find((tier) => rating >= tier.minRating)?.color ??
    DEFAULT_COLOR
  );
}

export function hexToRgba(hex: string, alpha: number): string {
  const parsed = hex.replace("#", "");
  const r = parseInt(parsed.slice(0, 2), 16);
  const g = parseInt(parsed.slice(2, 4), 16);
  const b = parseInt(parsed.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
