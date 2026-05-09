"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ background: "#05080F", color: "#E8EEF8", margin: 0 }}>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            padding: "24px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 640,
              border: "1px solid #1B2A45",
              borderRadius: 12,
              padding: 24,
              background: "rgba(14, 21, 34, 0.85)",
              textAlign: "center",
            }}
          >
            <h1 style={{ margin: 0, fontSize: 28 }}>Unexpected application error</h1>
            <p style={{ marginTop: 12, color: "#9DB0C8", fontSize: 14 }}>
              The app failed to render. Please try again.
            </p>
            {error?.digest ? (
              <p style={{ marginTop: 6, color: "#9DB0C8", fontSize: 12 }}>
                Error ID: {error.digest}
              </p>
            ) : null}
            <button
              type="button"
              onClick={reset}
              style={{
                marginTop: 16,
                border: 0,
                borderRadius: 8,
                padding: "10px 14px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
