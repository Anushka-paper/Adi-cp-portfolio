import { ImageResponse } from "next/og";
import { getProfileContent } from "@/lib/profile-content";
import { getSnapshots } from "@/lib/get-snapshots";
import { getNeonRankColor } from "@/lib/codeforces-rank-color";

// The `postgres` driver needs real Node sockets, not Edge-compatible —
// same reason the rest of the DB layer never runs on the edge runtime.
export const runtime = "nodejs";

export const alt = "CP Portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function Image() {
  const [content, snapshots] = await Promise.all([
    getProfileContent(),
    getSnapshots(),
  ]);

  const codeforcesProfile = snapshots.find(
    (s) => s.platform === "codeforces",
  )?.data;
  const accentColor = getNeonRankColor(codeforcesProfile?.currentRating);
  const glowText = codeforcesProfile?.rank
    ? `Codeforces ${capitalize(codeforcesProfile.rank)}`
    : content.role;

  const stats = snapshots
    .filter((s) => s.data?.currentRating != null)
    .map((s) => ({
      label: s.platform,
      rating: s.data!.currentRating,
    }));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0b0c",
          backgroundImage:
            "radial-gradient(120% 120% at 30% 10%, #1a1a1a 0%, #0f0f10 60%, #0b0b0c 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "0 80px",
          }}
        >
          {content.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- satori (ImageResponse) doesn't support next/image
            <img
              src={content.avatarUrl}
              alt=""
              width={140}
              height={140}
              style={{
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: 32,
                border: "4px solid rgba(255,255,255,0.15)",
              }}
            />
          )}

          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            {content.name}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#a3a3a3",
              marginTop: 8,
            }}
          >
            {content.role}
          </div>

          {stats.length > 0 && (
            <div style={{ display: "flex", gap: 24, marginTop: 48 }}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "16px 32px",
                    borderRadius: 20,
                    backgroundColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "white" }}>
                    {stat.rating}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      fontSize: 20,
                      color: "#a3a3a3",
                      textTransform: "capitalize",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div
            style={{
              display: "flex",
              marginTop: 48,
              padding: "14px 32px",
              borderRadius: 9999,
              backgroundColor: accentColor,
              color: "black",
              fontSize: 24,
              fontWeight: 600,
            }}
          >
            {glowText}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
