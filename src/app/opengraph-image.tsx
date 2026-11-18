import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WAWA Interiors - İç Mimarlık ve Fuar Standı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #000 0%, #1a1a1a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Accent Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#D4AF37",
          }}
        />

        {/* Logo + Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              background: "#D4AF37",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "48px",
              fontWeight: "bold",
              color: "#000",
            }}
          >
            W
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{ fontSize: "56px", fontWeight: "bold", color: "#fff" }}
            >
              WAWA Interiors
            </span>
            <span style={{ fontSize: "28px", color: "#D4AF37" }}>
              İç Mimarlık & Fuar Standı
            </span>
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: "60px",
            fontSize: "24px",
            color: "#888",
          }}
        >
          Anahtar Teslim Projeler | Tasarım + Üretim + Kurulum
        </div>

        {/* Stats */}
        <div
          style={{
            marginTop: "40px",
            display: "flex",
            gap: "40px",
            fontSize: "20px",
            color: "#666",
          }}
        >
          <span>67+ Marka</span>
          <span>•</span>
          <span>248 Proje</span>
          <span>•</span>
          <span>38 Ülke</span>
        </div>
      </div>
    ),
    { ...size }
  );
}






