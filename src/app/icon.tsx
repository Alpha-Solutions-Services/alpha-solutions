import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 30% 30%, #1f2a44, #0b0f1a)",
        }}
      >
        <div
          style={{
            width: 420,
            height: 420,
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
              fontSize: 240,
              lineHeight: 1,
              fontWeight: 900,
              color: "rgba(255,255,255,0.96)",
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial',
              transform: "translateY(8px)",
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

