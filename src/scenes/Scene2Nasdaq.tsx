import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS } from "../config";
import { SceneContainer } from "../components/SceneContainer";
import { WordReveal } from "../components/WordReveal";
import { clamp01, pop } from "../lib/anim";

const UpArrow: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.accent }) => (
  <svg width={size} height={size} viewBox="0 0 10 10">
    <path d="M5 1 L9.5 9 L0.5 9 Z" fill={color} />
  </svg>
);

export const Scene2Nasdaq: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXTS.nasdaq;
  const cardIn = pop(frame, fps, 34);
  const tapeX = -((frame * 7) % 1200);

  const tapeItems = [...t.tape, ...t.tape, ...t.tape, ...t.tape];

  return (
    <SceneContainer enter="slideLeft">
      <WordReveal text={t.title} highlight={t.highlight} delay={4} stagger={4} fontSize={94} />

      <div
        style={{
          marginTop: 70,
          width: 860,
          padding: "40px 50px 46px",
          borderRadius: 40,
          background: COLORS.surface,
          border: `3px solid ${COLORS.accent}`,
          boxShadow: `0 0 80px rgba(255,107,44,${0.25 * cardIn})`,
          transform: `scale(${0.6 + 0.4 * cardIn}) rotate(${(1 - cardIn) * -6}deg)`,
          opacity: interpolate(cardIn, [0, 0.4], [0, 1], clamp01),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 8, color: COLORS.muted }}>
          {t.exchange}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 30, marginTop: 6 }}>
          <div style={{ display: "flex" }}>
            {t.ticker.split("").map((ch, i) => {
              const s = pop(frame, fps, 42 + i * 5, { damping: 10, stiffness: 180 });
              return (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    fontSize: 230,
                    fontWeight: 900,
                    lineHeight: 1,
                    letterSpacing: -6,
                    color: COLORS.white,
                    transform: `perspective(600px) rotateX(${(1 - s) * 90}deg)`,
                    opacity: interpolate(s, [0, 0.3], [0, 1], clamp01),
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
          <div
            style={{
              transform: `translateY(${(1 - pop(frame, fps, 60)) * 60}px)`,
              opacity: interpolate(frame, [60, 66], [0, 1], clamp01),
            }}
          >
            <UpArrow size={110} />
          </div>
        </div>
        <div style={{ fontSize: 38, fontWeight: 700, color: COLORS.accent, marginTop: 4 }}>
          {t.tickerCaption}
        </div>
      </div>

      {/* Bandeau défilant façon écran de bourse */}
      <div
        style={{
          marginTop: 60,
          width: 1080,
          overflow: "hidden",
          borderTop: `2px solid ${COLORS.border}`,
          borderBottom: `2px solid ${COLORS.border}`,
          padding: "18px 0",
          opacity: interpolate(frame, [50, 62], [0, 1], clamp01),
        }}
      >
        <div style={{ display: "flex", gap: 50, transform: `translateX(${tapeX}px)`, whiteSpace: "nowrap" }}>
          {tapeItems.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 34, fontWeight: 800 }}>
              <UpArrow size={24} />
              <span style={{ color: i % 5 === 0 ? COLORS.accent : COLORS.white }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </SceneContainer>
  );
};
