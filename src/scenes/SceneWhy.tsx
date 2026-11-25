import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS, TIMINGS, sec } from "../config";
import { SceneContainer } from "../components/SceneContainer";
import { WordReveal } from "../components/WordReveal";
import { clamp01, pop } from "../lib/anim";

/** Scène « pourquoi » : les causes de la chute, une carte par raison. */
export const SceneWhy: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXTS.why;
  const tm = TIMINGS.why;

  return (
    <SceneContainer enter="slideLeft" drift={0.015}>
      <WordReveal text={t.title} highlight={["fall?"]} delay={2} stagger={4} fontSize={100} />

      <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 50, width: 940 }}>
        {t.reasons.map((r, i) => {
          const at = sec(tm.cardsStart + i * tm.cardStagger);
          const s = pop(frame, fps, at, { damping: 13, stiffness: 150 });
          return (
            <div
              key={r.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 30,
                padding: "26px 32px",
                borderRadius: 30,
                background: COLORS.surface,
                border: `2px solid ${COLORS.border}`,
                opacity: interpolate(s, [0, 0.4], [0, 1], clamp01),
                transform: `translateX(${(1 - s) * 260}px)`,
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 92,
                  height: 92,
                  borderRadius: 46,
                  background: COLORS.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 50,
                  fontWeight: 900,
                }}
              >
                {i + 1}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 50, fontWeight: 900, letterSpacing: -1 }}>{r.title}</div>
                <div style={{ fontSize: 31, fontWeight: 600, color: COLORS.muted, lineHeight: 1.25 }}>{r.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};
