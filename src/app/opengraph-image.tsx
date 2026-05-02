import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/data/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          <div
            style={{
              fontSize: 24,
              opacity: 0.72,
              maxWidth: 860,
              lineHeight: 1.35,
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial',
            }}
          >
            Transparent delivery, modern UI/UX, and a secure client portal.
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
          <div
            style={{
              fontSize: 200,
              lineHeight: 1,
              fontWeight: 900,
              color: "rgba(255,255,255,0.96)",
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial',
              transform: "translateY(6px)",
              textShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            A
          </div>
        </div>
      </div>
    ),
    size
  );
}

