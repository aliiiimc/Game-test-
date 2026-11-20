import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { SAFE_MARGIN, TIMINGS } from "../config";
import { clamp01 } from "../lib/anim";

export type EnterStyle = "zoom" | "slideUp" | "slideLeft";

type Props = {
  children: React.ReactNode;
  enter?: EnterStyle;
  /** Zoom lent continu pendant la scène. */
  drift?: number;
};

/**
 * Zone de contenu d'une scène (entre le bandeau et les sous-titres),
 * avec animation d'entrée / sortie.
 */
export const SceneContainer: React.FC<Props> = ({ children, enter = "zoom", drift = 0.04 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const tf = TIMINGS.transitionFrames;

  const inP = interpolate(frame, [0, tf], [0, 1], {
    ...clamp01,
    easing: (x) => 1 - Math.pow(1 - x, 3),
  });
  const outP = interpolate(frame, [durationInFrames - 6, durationInFrames], [0, 1], clamp01);

  let tx = 0;
  let ty = 0;
  let scale = 1 + drift * (frame / durationInFrames);
  if (enter === "zoom") scale *= 1.15 - 0.15 * inP;
  if (enter === "slideUp") ty = (1 - inP) * 160;
  if (enter === "slideLeft") tx = (1 - inP) * 220;
  scale *= 1 - 0.05 * outP;

  return (
    <AbsoluteFill
      style={{
        top: SAFE_MARGIN + 80,
        bottom: SAFE_MARGIN + 230,
        left: 60,
        right: 60,
        width: "auto",
        height: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: inP * (1 - outP),
        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
