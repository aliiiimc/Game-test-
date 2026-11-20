import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS, TIMINGS, sec } from "../config";
import { SceneContainer } from "../components/SceneContainer";
import { WordReveal } from "../components/WordReveal";
import { clamp01, fadeIn, pop, shake } from "../lib/anim";
import { formatFr } from "../lib/format";

const BAR_H = 360;

export const Scene6Valuation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = TEXTS.valuation;
  const tm = TIMINGS.valuation;
  const start = sec(tm.counterStart);
  const end = start + sec(tm.counterDuration);
  const v = interpolate(frame, [start, end], [0, t.value], {
    ...clamp01,
    easing: Easing.out(Easing.exp),
  });
  const barsAt = sec(tm.barsAt);
  const grow = (delay: number) =>
    interpolate(frame, [barsAt + delay, barsAt + delay + 16], [0, 1], {
      ...clamp01,
      easing: Easing.out(Easing.back(1.6)),
    });
  const a = grow(0);
  const b = grow(4);

  const Bar: React.FC<{ h: number; label: string; color: string; textColor: string; showValue?: boolean }> = ({ h, label, color, textColor, showValue }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ height: BAR_H, display: "flex", alignItems: "flex-end" }}>
        <div
          style={{
            width: 230,
            height: BAR_H * h,
            borderRadius: "24px 24px 8px 8px",
            background: color,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: 20,
            color: textColor,
            fontSize: 34,
            fontWeight: 900,
            overflow: "hidden",
          }}
        >
          {showValue && h > 0.5 ? `${t.prefix}${formatFr(t.value)}\u00A0Md$` : ""}
        </div>
      </div>
      <div style={{ fontSize: 40, fontWeight: 800 }}>{label}</div>
    </div>
  );

  return (
    <SceneContainer enter="slideLeft">
      <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: 8, color: COLORS.muted, opacity: fadeIn(frame, 0) }}>
        {t.label}
      </div>
      <div
        style={{
          fontSize: 230,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: -8,
          color: COLORS.white,
          whiteSpace: "nowrap",
          transform: `${shake(frame, end, 14, 12, 1.3)} scale(${interpolate(pop(frame, fps, 0), [0, 1], [0.7, 1])})`,
          marginTop: 10,
        }}
      >
        <span style={{ color: COLORS.accent }}>{t.prefix}</span>
        {formatFr(Math.round(v / 10) * 10)}
      </div>
      <div style={{ fontSize: 80, fontWeight: 800, marginTop: -4 }}>{t.unit}</div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 60, marginTop: 50 }}>
        <Bar h={a} showValue label={t.barA} color={COLORS.accent} textColor={COLORS.white} />
        <div style={{ fontSize: 110, fontWeight: 900, color: COLORS.muted, marginBottom: 170, opacity: fadeIn(frame, barsAt + 8) }}>≈</div>
        <Bar h={b} label={t.barB} color={COLORS.white} textColor={COLORS.bg} />
      </div>

      <div style={{ marginTop: 40 }}>
        <WordReveal text={t.compare} highlight={t.compareHighlight} delay={barsAt + 10} stagger={3} fontSize={72} fontWeight={900} />
      </div>
      <div style={{ marginTop: 26, fontSize: 30, fontWeight: 600, color: COLORS.muted, opacity: fadeIn(frame, barsAt + 24, 10) }}>
        {t.note}
      </div>
    </SceneContainer>
  );
};
