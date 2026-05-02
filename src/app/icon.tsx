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
          <svg
            width="300"
            height="300"
            viewBox="0 0 512 512"
            style={{ filter: "drop-shadow(0 18px 60px rgba(0,0,0,0.35))" }}
            aria-hidden
          >
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

