import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            width: 150,
            height: 150,
            borderRadius: 42,
            background: "linear-gradient(135deg, #21d4fd, #b721ff)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: 86,
              lineHeight: 1,
              fontWeight: 900,
              color: "rgba(255,255,255,0.96)",
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Arial',
              transform: "translateY(3px)",
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

