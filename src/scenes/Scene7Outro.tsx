import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS, TIMINGS, sec } from "../config";
import { SceneContainer } from "../components/SceneContainer";
import { clamp01, pop, shake } from "../lib/anim";

export const Scene7Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXTS.outro;
  const tm = TIMINGS.outro;
  const q = sec(tm.questionAt);

  const w1 = pop(frame, fps, q, { damping: 10, stiffness: 200 });
  const w2 = pop(frame, fps, q + 5);
  const w3 = pop(frame, fps, q + 9, { damping: 10, stiffness: 200 });
  const cta = pop(frame, fps, sec(tm.ctaAt));
  const collab = pop(frame, fps, sec(tm.collabAt));
  const bounce = Math.abs(Math.sin(frame / 5)) * 22;
  const flash = interpolate(frame, [q, q + 10], [0.5, 0], clamp01);

  return (
    <SceneContainer enter="zoom" drift={0.03}>
      <div
        style={{
          position: "absolute",
          inset: -400,
          background: COLORS.accent,
          opacity: frame >= q ? flash : 0,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: shake(frame, q + 9, 20, 14, 1.4),
        }}
      >
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -8,
            transform: `translateX(${(1 - w1) * -500}px) rotate(${(1 - w1) * -10}deg)`,
            opacity: interpolate(w1, [0, 0.3], [0, 1], clamp01),
          }}
        >
          {t.word1}
        </div>
        <div
          style={{
            fontSize: 90,
            fontWeight: 800,
            color: COLORS.muted,
            margin: "6px 0",
            transform: `scale(${w2})`,
          }}
        >
          {t.word2}
        </div>
        <div
          style={{
            fontSize: 140,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -5,
            color: COLORS.accent,
            whiteSpace: "nowrap",
            transform: `translateX(${(1 - w3) * 500}px) scale(${0.6 + 0.4 * w3})`,
            opacity: interpolate(w3, [0, 0.3], [0, 1], clamp01),
            textShadow: "0 0 60px rgba(255,107,44,0.4)",
          }}
        >
          {t.word3}
        </div>
      </div>

      <div
        style={{
          marginTop: 90,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          transform: `scale(${cta})`,
        }}
      >
        <div style={{ fontSize: 62, fontWeight: 800 }}>{t.cta}</div>
        <svg width={70} height={70} viewBox="0 0 10 10" style={{ transform: `translateY(${bounce}px)` }}>
          <path d="M1 3 L5 7.5 L9 3" stroke={COLORS.accent} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div
        style={{
          marginTop: 50,
          padding: "22px 40px",
          borderRadius: 999,
          border: `3px solid ${COLORS.accent}`,
          background: COLORS.accentSoft,
          fontSize: 40,
          fontWeight: 800,
          letterSpacing: 1,
          opacity: interpolate(collab, [0, 0.4], [0, 1], clamp01),
          transform: `translateY(${(1 - collab) * 60}px)`,
        }}
      >
        {t.collab}
      </div>
    </SceneContainer>
  );
};
