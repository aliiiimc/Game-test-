import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SAFE_MARGIN, TEXTS } from "../config";
import { clamp01 } from "../lib/anim";

/** Bandeau supérieur (dans la zone sûre) + barre de progression. */
export const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const opacity = interpolate(frame, [0, 12], [0, 1], clamp01);
  const progress = frame / (durationInFrames - 1);

  return (
    <div
      style={{
        position: "absolute",
        top: SAFE_MARGIN + 10,
        left: 70,
        right: 70,
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: COLORS.muted,
        }}
      >
        <span>{TEXTS.header.left}</span>
        <span style={{ color: COLORS.accent }}>{TEXTS.header.right}</span>
      </div>
      <div
        style={{
          marginTop: 18,
          height: 6,
          borderRadius: 3,
          background: COLORS.border,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: COLORS.accent,
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
};
