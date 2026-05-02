import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/data/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "radial-gradient(circle at 20% 30%, #1f2a44, #0b0f1a)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: -1.2,
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial',
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              fontSize: 34,
              opacity: 0.92,
              maxWidth: 760,
              lineHeight: 1.2,
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial',
            }}
          >
            Web Development, SaaS &amp; AI Automation
          </div>
        </div>

        <div
          style={{
            width: 360,
            height: 360,
            borderRadius: 120,
            background: "linear-gradient(135deg, #21d4fd, #b721ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 40px 120px rgba(0,0,0,0.45)",
          }}
        >
          <svg width="240" height="240" viewBox="0 0 512 512" aria-hidden>
            <path
              d="M256 128c10 0 19 5 24 14l92 170c8 15-3 34-20 34h-52c-9 0-18-5-22-13l-22-41h-63l-22 41c-4 8-13 13-22 13h-52c-17 0-28-19-20-34l92-170c5-9 14-14 24-14zm0 83-33 62h66l-33-62z"
              fill="rgba(255,255,255,0.96)"
            />
          </svg>
        </div>
      </div>
    ),
    size
  );
}

