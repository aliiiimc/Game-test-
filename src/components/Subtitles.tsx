import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  COLORS,
  SAFE_MARGIN,
  SCENE_DURATIONS,
  SCENE_ORDER,
  VOICEOVER,
  sceneStartSeconds,
} from "../config";
import { clamp01 } from "../lib/anim";

/**
 * Sous-titres toujours visibles, au-dessus de la marge basse.
 * La phrase de la scène est affichée pendant toute la scène ;
 * les mots s'allument au rythme de la voix off (timings de config.ts),
 * répartis proportionnellement à leur longueur.
 */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const sceneId =
    SCENE_ORDER.find((id) => {
      const s = sceneStartSeconds(id);
      return t >= s && t < s + SCENE_DURATIONS[id];
    }) ?? SCENE_ORDER[SCENE_ORDER.length - 1];

  const sceneStart = sceneStartSeconds(sceneId);
  const vo = VOICEOVER[sceneId];
  const local = t - sceneStart;
  const words = vo.text.split(" ");

  // Timings par mot, proportionnels au nombre de caractères.
  const weights = words.map((w) => w.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  const span = vo.end - vo.start;
  let acc = vo.start;
  const ranges = weights.map((wgt) => {
    const a = acc;
    acc += (wgt / total) * span;
    return [a, acc] as const;
  });

  const enter = interpolate(local, [0, 0.2], [0, 1], clamp01);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: SAFE_MARGIN + 20,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: COLORS.subtitleBg,
          border: `2px solid ${COLORS.border}`,
          borderRadius: 28,
          padding: "26px 36px",
          maxWidth: 960,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 14,
          rowGap: 4,
          fontSize: 48,
          fontWeight: 800,
          lineHeight: 1.22,
          textAlign: "center",
          transform: `translateY(${(1 - enter) * 20}px)`,
          opacity: 0.4 + 0.6 * enter,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        {words.map((w, i) => {
          const [a, b] = ranges[i];
          const active = local >= a && local < b;
          const spoken = local >= b;
          return (
            <span
              key={`${sceneId}-${i}`}
              style={{
                color: active ? COLORS.accent : COLORS.white,
                opacity: active || spoken ? 1 : 0.42,
                transform: active ? "scale(1.06)" : "scale(1)",
                display: "inline-block",
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};
