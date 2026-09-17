import { ImageResponse } from "next/og";

export const alt = "Coined — search real-world code to find out how other developers name things";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#2b1a33",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 90,
              height: 90,
              borderRadius: "50%",
              background: "#ffd23f",
              color: "#2b1a33",
              fontSize: 56,
              fontWeight: 800,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            C
          </div>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: "#fdf6e3" }}>
            Coined
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 40, color: "#fdf6e3", opacity: 0.85, maxWidth: 900 }}>
          How do other developers name this? Search real, public code.
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 56 }}>
          {["#ffd23f", "#ff6ec7", "#4ecdc4", "#c6f24e", "#ff8c42"].map((c) => (
            <div key={c} style={{ display: "flex", width: 28, height: 28, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
