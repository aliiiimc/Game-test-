import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, SCENE_ORDER, TIMINGS, sceneStartFrame } from "../config";
import { clamp01 } from "../lib/anim";

/** Bande orange diagonale qui balaie l'écran à chaque changement de scène. */
export const TransitionWipe: React.FC = () => {
  const frame = useCurrentFrame();
  const { width } = useVideoConfig();
  const half = TIMINGS.transitionFrames / 2;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {SCENE_ORDER.slice(1).map((id) => {
        const at = sceneStartFrame(id);
        if (frame < at - half - 1 || frame > at + half + 1) return null;
        const p = interpolate(frame, [at - half, at + half], [0, 1], clamp01);
        const x = interpolate(p, [0, 1], [-width * 1.6, width * 1.6]);
        return (
          <AbsoluteFill key={id}>
            <div
              style={{
                position: "absolute",
                top: "-20%",
                left: x,
                width: width * 0.9,
                height: "140%",
                background: `linear-gradient(90deg, transparent, ${COLORS.accent} 35%, #ffb08a 50%, ${COLORS.accent} 65%, transparent)`,
                transform: "skewX(-18deg)",
                opacity: 0.9,
              }}
            />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
