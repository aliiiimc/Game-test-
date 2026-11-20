import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config";

/** Fond sombre animé : grille discrète + halo orange qui dérive. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const t = frame / 30;
  const gx = width * (0.5 + 0.28 * Math.sin(t * 0.35));
  const gy = height * (0.42 + 0.12 * Math.cos(t * 0.27));
  const gridOffset = (frame * 0.6) % 90;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${COLORS.grid} 2px, transparent 2px), linear-gradient(90deg, ${COLORS.grid} 2px, transparent 2px)`,
          backgroundSize: "90px 90px",
          backgroundPosition: `0px ${gridOffset}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${gx}px ${gy}px, rgba(255,107,44,0.22) 0%, rgba(255,107,44,0.06) 28%, transparent 55%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
