import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS, TIMINGS, sec } from "../config";
import { SceneContainer } from "../components/SceneContainer";
import { clamp01, pop, shake } from "../lib/anim";
import { money } from "../lib/format";

/** Positions des bulles (centre x, y et rayon) dans une zone 960 × 760. */
const LAYOUT = [
  { x: 230, y: 180, r: 140 },
  { x: 650, y: 170, r: 160 },
  { x: 450, y: 420, r: 145 },
  { x: 120, y: 440, r: 90 },
  { x: 790, y: 440, r: 105 },
  { x: 260, y: 640, r: 100 },
  { x: 660, y: 660, r: 95 },
];
const K = 0.82; // échelle de la zone de bulles

export const Scene4Investors: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXTS.investors;
  const tm = TIMINGS.investors;

  const extraAt = sec(tm.extraAt);
  const totalAt = sec(tm.totalAt);
  const extra = pop(frame, fps, extraAt, { damping: 9, stiffness: 170 });
  const totalIn = pop(frame, fps, totalAt);
  const countEnd = totalAt + 18;
  const totalVal = interpolate(frame, [totalAt, countEnd], [t.totalFrom, t.total], {
    ...clamp01,
    easing: Easing.out(Easing.cubic),
  });

  return (
    <SceneContainer enter="slideUp" drift={0.02}>
      <div style={{ position: "relative", width: 960 * K, height: 780 * K }}>
        {t.companies.map((name, i) => {
          const L = LAYOUT[i % LAYOUT.length];
          const s = pop(frame, fps, sec(tm.bubblesStart + i * tm.bubbleStagger), {
            damping: 9,
            stiffness: 150,
          });
          const featured = t.featured.indexOf(name) !== -1;
          const r = L.r * K;
          const floatY = Math.sin(frame / 14 + i * 1.3) * 8;
          return (
            <div
              key={name}
              style={{
                position: "absolute",
                left: L.x * K - r,
                top: L.y * K - r,
                width: r * 2,
                height: r * 2,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: featured
                  ? "radial-gradient(circle at 35% 30%, #ff8f5c, #FF6B2C 60%, #c94a14)"
                  : COLORS.surface,
                border: featured ? "none" : `3px solid ${COLORS.border}`,
                boxShadow: featured ? "0 0 50px rgba(255,107,44,0.35)" : "none",
                color: COLORS.white,
                fontSize: Math.max(24, r * 0.3),
                fontWeight: 800,
                transform: `translateY(${floatY}px) scale(${s})`,
              }}
            >
              {name}
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 10,
          padding: "18px 44px",
          borderRadius: 999,
          background: COLORS.white,
          color: COLORS.bg,
          fontSize: 70,
          fontWeight: 900,
          letterSpacing: -1,
          transform: `scale(${extra}) rotate(${(1 - extra) * 8}deg)`,
        }}
      >
        {t.extra}
      </div>

      <div
        style={{
          marginTop: 34,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: interpolate(totalIn, [0, 0.5], [0, 1], clamp01),
          transform: `translateY(${(1 - totalIn) * 50}px)`,
        }}
      >
        <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 6, color: COLORS.muted }}>{t.totalLabel}</div>
        <div
          style={{
            fontSize: 130,
            fontWeight: 900,
            lineHeight: 1.05,
            letterSpacing: -4,
            color: COLORS.accent,
            transform: shake(frame, countEnd, 12, 12, frame >= totalAt ? 1.1 : 0),
            whiteSpace: "nowrap",
          }}
        >
          {money(totalVal, 1)} <span style={{ color: COLORS.white, fontSize: 70 }}>{t.totalUnit}</span>
        </div>
      </div>
    </SceneContainer>
  );
};
