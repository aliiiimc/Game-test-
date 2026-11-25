import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS, TIMINGS, sec } from "../config";
import { SceneContainer } from "../components/SceneContainer";
import { clamp01, fadeIn, pop, shake } from "../lib/anim";
import { money } from "../lib/format";

const CHART_W = 920;
const CHART_H = 440;
const Y_MIN = 60;
const Y_MAX = 105;
const yOf = (v: number) => CHART_H - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * CHART_H;

/** Scène « la chute » : cours de clôture qui passent sous le prix d'IPO. */
export const SceneDrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXTS.drop;
  const tm = TIMINGS.drop;

  const cStart = sec(tm.counterStart);
  const cEnd = cStart + sec(tm.counterDuration);
  const change = interpolate(frame, [cStart, cEnd], [0, t.change], {
    ...clamp01,
    easing: Easing.out(Easing.cubic),
  });
  const landed = frame >= cEnd;
  const headerIn = pop(frame, fps, 0);

  const n = t.bars.length;
  const slot = CHART_W / n;
  const barW = slot * 0.58;
  const ipoY = yOf(t.ipoPrice);
  const lastAt = sec(tm.barsStart + (n - 1) * tm.barStagger);

  return (
    <SceneContainer enter="slideUp" drift={0.02}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: headerIn,
          transform: `translateY(${(1 - headerIn) * 40}px)`,
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 900, letterSpacing: -2 }}>{t.title}</div>
        <div
          style={{
            fontSize: 190,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -6,
            color: COLORS.negative,
            fontVariantNumeric: "tabular-nums",
            transform: shake(frame, cEnd, 18, 14, landed ? 1.3 : 0.4),
            textShadow: landed ? "0 0 60px rgba(255,77,77,0.45)" : "none",
          }}
        >
          {Math.round(change)}%
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, color: COLORS.muted }}>{t.changeCaption}</div>
      </div>

      <div style={{ position: "relative", width: CHART_W, height: CHART_H, marginTop: 50 }}>
        {/* Ligne du prix d'IPO */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: ipoY,
            width: CHART_W * interpolate(frame, [4, 20], [0, 1], clamp01),
            borderTop: `4px dashed rgba(255,255,255,0.7)`,
          }}
        />

        {t.bars.map((b, i) => {
          const at = sec(tm.barsStart + i * tm.barStagger);
          const g = interpolate(frame, [at, at + 12], [0, 1], {
            ...clamp01,
            easing: Easing.out(Easing.back(1.4)),
          });
          const below = b.value < t.ipoPrice;
          const h = (CHART_H - yOf(b.value)) * g;
          const x = i * slot + (slot - barW) / 2;
          return (
            <div key={b.label}>
              <div
                style={{
                  position: "absolute",
                  left: x,
                  bottom: 0,
                  width: barW,
                  height: h,
                  borderRadius: "18px 18px 6px 6px",
                  background: below ? COLORS.negative : COLORS.white,
                  opacity: below ? 1 : 0.9,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: x - 20,
                  width: barW + 40,
                  bottom: h + 12,
                  textAlign: "center",
                  fontSize: 36,
                  fontWeight: 900,
                  color: below ? COLORS.negative : COLORS.white,
                  opacity: interpolate(g, [0.6, 1], [0, 1], clamp01),
                }}
              >
                {money(b.value, b.value % 1 === 0 ? 0 : 2)}
              </div>
              <div
                style={{
                  position: "absolute",
                  left: x - 20,
                  width: barW + 40,
                  top: CHART_H + 14,
                  textAlign: "center",
                  fontSize: 30,
                  fontWeight: 700,
                  color: COLORS.muted,
                  opacity: fadeIn(frame, at),
                }}
              >
                {b.label}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: 100,
          padding: "16px 36px",
          borderRadius: 999,
          background: "rgba(255,77,77,0.14)",
          border: `3px solid ${COLORS.negative}`,
          fontSize: 44,
          fontWeight: 900,
          transform: `scale(${pop(frame, fps, lastAt + 6)})`,
        }}
      >
        {t.caption}
      </div>
      <div style={{ marginTop: 16, fontSize: 26, fontWeight: 600, color: COLORS.muted, opacity: fadeIn(frame, lastAt + 10) }}>
        {t.footnote}
      </div>
    </SceneContainer>
  );
};
