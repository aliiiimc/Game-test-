import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS } from "../config";
import { SceneContainer } from "../components/SceneContainer";
import { WordReveal } from "../components/WordReveal";
import { fadeIn, pop } from "../lib/anim";

export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXTS.intro;
  const badge = pop(frame, fps, 2);
  const pulse = 0.6 + 0.4 * Math.abs(Math.sin(frame / 6));

  return (
    <SceneContainer enter="zoom" drift={0.07}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "16px 30px",
          borderRadius: 999,
          background: COLORS.accentSoft,
          border: `2px solid ${COLORS.accent}`,
          color: COLORS.accent,
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: 3,
          transform: `scale(${badge})`,
          marginBottom: 70,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: COLORS.accent,
            opacity: pulse,
          }}
        />
        {t.badge}
      </div>

      <WordReveal text={t.title} highlight={t.highlight} delay={8} stagger={4} fontSize={128} />

      <div
        style={{
          marginTop: 70,
          fontSize: 40,
          fontWeight: 600,
          color: COLORS.muted,
          opacity: fadeIn(frame, 66, 12),
        }}
      >
        {t.note}
      </div>
    </SceneContainer>
  );
};
