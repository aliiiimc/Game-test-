import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS, TIMINGS, sec } from "../config";
import { SceneContainer } from "../components/SceneContainer";
import { WordReveal } from "../components/WordReveal";
import { clamp01, fadeIn, pop, shake } from "../lib/anim";
import { money } from "../lib/format";

export const Scene3Raise: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXTS.raise;
  const tm = TIMINGS.raise;
  const start = sec(tm.counterStart);
  const end = start + sec(tm.counterDuration);

  const p = interpolate(frame, [start, end], [0, 1], {
    ...clamp01,
    easing: Easing.out(Easing.cubic),
  });
  const value = t.value * p;
  const landed = frame >= end;
  const punch = landed ? pop(frame, fps, end, { damping: 8, stiffness: 220 }) : 0;
  const ringP = interpolate(frame, [end, end + 18], [0, 1], clamp01);

  return (
    <SceneContainer enter="zoom">
      <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 8, color: COLORS.muted, opacity: fadeIn(frame, 2) }}>
        {t.label}
      </div>

      <div style={{ position: "relative", marginTop: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Onde de choc à l'impact */}
        {landed ? (
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 700,
              height: 700,
              marginLeft: -350,
              marginTop: -350,
              borderRadius: "50%",
              border: `8px solid ${COLORS.accent}`,
              transform: `scale(${0.3 + ringP * 1.2})`,
              opacity: 1 - ringP,
            }}
          />
        ) : null}
        <div
          style={{
            fontSize: 250,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: -10,
            color: landed ? COLORS.accent : COLORS.white,
            fontVariantNumeric: "tabular-nums",
            transform: `${shake(frame, end, 18, 14, landed ? 1.4 : 0.6)} scale(${landed ? 1 + 0.15 * (1 - punch) : 1})`,
            textShadow: landed ? "0 0 60px rgba(255,107,44,0.45)" : "none",
          }}
        >
          {money(value, t.decimals)}
        </div>
        <div style={{ fontSize: 92, fontWeight: 800, color: COLORS.white, marginTop: -6 }}>{t.unit}</div>
      </div>

      {/* Barre de progression du compteur */}
      <div style={{ marginTop: 50, width: 820, height: 22, borderRadius: 11, background: COLORS.border, overflow: "hidden" }}>
        <div style={{ width: `${p * 100}%`, height: "100%", background: COLORS.accent, borderRadius: 11 }} />
      </div>

      <div style={{ marginTop: 60 }}>
        <WordReveal text={t.sub} highlight={t.subHighlight} delay={sec(tm.subAt)} stagger={3} fontSize={70} fontWeight={800} />
      </div>
    </SceneContainer>
  );
};
