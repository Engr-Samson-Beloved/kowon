import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // Dynamic Golden Letter K Favicon
      <div
        style={{
          fontSize: 18,
          background: "#0a0a0a", // Obsidian Background
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#D97706", // Premium Gold (amber-600)
          fontWeight: 900,
          fontFamily: "Georgia, serif",
          border: "2px solid #D97706",
        }}
      >
        K
      </div>
    ),
    {
      ...size,
    }
  );
}
