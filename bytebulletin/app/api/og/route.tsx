import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Latest Tech News & AI Bulletins";
    const category = searchParams.get("category") || "TECH NEWS";
    const source = searchParams.get("source") || "ByteBulletin";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#090d16",
            backgroundImage: "radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.25) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(14, 165, 233, 0.15) 0%, transparent 40%)",
            padding: "60px",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {/* Top Neon Bar */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "8px",
              background: "linear-gradient(to right, #8b5cf6, #6366f1, #06b6d4)",
            }}
          />

          {/* Top Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  backgroundColor: "rgba(139, 92, 246, 0.2)",
                  border: "1px solid rgba(139, 92, 246, 0.4)",
                  marginRight: "14px",
                  color: "#a78bfa",
                  fontSize: "24px",
                  fontWeight: "bold",
                }}
              >
                ⚡
              </div>
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-0.5px",
                }}
              >
                BYTE<span style={{ color: "#a78bfa" }}>BULLETIN</span>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 20px",
                borderRadius: "9999px",
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.4)",
                color: "#c084fc",
                fontSize: "14px",
                fontWeight: 800,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
          </div>

          {/* Middle Article Title */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "20px", marginBottom: "20px" }}>
            <h1
              style={{
                fontSize: title.length > 70 ? "46px" : "56px",
                fontWeight: 800,
                color: "#f8fafc",
                lineHeight: 1.25,
                letterSpacing: "-1px",
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: 3,
                overflow: "hidden",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom Footer Attribution */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  marginRight: "10px",
                }}
              />
              <span style={{ color: "#94a3b8", fontSize: "18px", fontWeight: 600 }}>
                Reported by <strong style={{ color: "#e2e8f0" }}>{source}</strong>
              </span>
            </div>

            <span style={{ color: "#64748b", fontSize: "16px", fontWeight: 600 }}>
              thebytebulletin.com
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG Image generation error:", e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
