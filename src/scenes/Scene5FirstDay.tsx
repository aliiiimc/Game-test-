import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, TEXTS, TIMINGS, sec } from "../config";
import { SceneContainer } from "../components/SceneContainer";
import { clamp01, pop, shake } from "../lib/anim";
import { money } from "../lib/format";

const W = 960;
const H = 560;
const PAD = { l: 30, r: 30, t: 50, b: 50 };
const Y_MIN = 75;
const Y_MAX = 120;
const N = 140;
const OPEN_U = 0.06; // moment de l'ouverture sur l'axe du temps

const t = TEXTS.firstDay;

/** Cours simulé : IPO → ouverture → glissement vers la clôture. */
const priceAt = (u: number): number => {
  if (u <= 0.02) return t.ipoPrice;
  if (u <= OPEN_U) return interpolate(u, [0.02, OPEN_U], [t.ipoPrice, t.openPrice]);
  const v = (u - OPEN_U) / (1 - OPEN_U);
  const base = t.openPrice + (t.closePrice - t.openPrice) * (1 - Math.pow(1 - v, 1.4));
  const noise =
    (2.6 * Math.sin(v * 19) + 1.7 * Math.sin(v * 47 + 0.7) + 0.9 * Math.sin(v * 93 + 2)) *
    Math.sin(Math.PI * v);
  return base + noise;
};

const POINTS = Array.from({ length: N }, (_, i) => {
  const u = i / (N - 1);
  return { u, p: priceAt(u) };
});

const xOf = (u: number) => PAD.l + u * (W - PAD.l - PAD.r);
const yOf = (p: number) => PAD.t + (1 - (p - Y_MIN) / (Y_MAX - Y_MIN)) * (H - PAD.t - PAD.b);

const pct = (p: number) => Math.round((p / t.ipoPrice - 1) * 100);

const Label: React.FC<{ x: number; y: number; show: number; title: string; value: string; accent?: boolean; align?: "left" | "right" }> = ({
  x,
  y,
  show,
  title,
  value,
  accent,
  align = "left",
}) => (
  <div
    style={{
      position: "absolute",
      left: align === "left" ? x : undefined,
      right: align === "right" ? W - x : undefined,
      top: y,
      padding: "10px 18px",
      borderRadius: 16,
      background: accent ? COLORS.accent : COLORS.surface,
      border: accent ? "none" : `2px solid ${COLORS.border}`,
      color: COLORS.white,
      fontSize: 28,
      fontWeight: 700,
      whiteSpace: "nowrap",
      transform: `scale(${show})`,
      transformOrigin: align === "left" ? "left center" : "right center",
      opacity: interpolate(show, [0, 0.4], [0, 1], clamp01),
    }}
  >
    {title} <span style={{ fontWeight: 900 }}>{value}</span>
  </div>
);

export const Scene5FirstDay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tm = TIMINGS.firstDay;
  const start = sec(tm.chartStart);
  const end = start + sec(tm.chartDuration);
  const prog = interpolate(frame, [start, end], [0, 1], clamp01);

  const visible = POINTS.filter((pt) => pt.u <= prog);
  const head = { u: prog, p: priceAt(prog) };
  const pts = [...visible, head];
  const line = pts.map((pt, i) => `${i === 0 ? "M" : "L"}${xOf(pt.u).toFixed(1)},${yOf(pt.p).toFixed(1)}`).join(" ");
  const area = `${line} L${xOf(head.u).toFixed(1)},${H - PAD.b} L${xOf(0)},${H - PAD.b} Z`;

  const openFrame = start + Math.round(OPEN_U * (end - start));
  const ipoShow = pop(frame, fps, start - 4);
  const openShow = pop(frame, fps, openFrame);
  const closeShow = pop(frame, fps, end);
  const livePct = pct(head.p);
  const done = frame >= end;
  const headerIn = pop(frame, fps, 2);

  const stats = [
    { label: t.ipoLabel, value: `${money(t.ipoPrice)}`, delta: "", at: start - 4 },
    { label: t.openLabel, value: `${money(t.openPrice, 2)}`, delta: `+${pct(t.openPrice)}%`, at: openFrame },
    { label: t.closeLabel, value: `${money(t.closePrice, 2)}`, delta: `+${pct(t.closePrice)}%`, at: end },
  ];

  return (
    <SceneContainer enter="zoom" drift={0.02}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 30,
          transform: `translateY(${(1 - headerIn) * 40}px)`,
          opacity: headerIn,
        }}
      >
        <span style={{ fontSize: 86, fontWeight: 900, letterSpacing: -2 }}>{t.title}</span>
        <span
          style={{
            display: "inline-block",
            fontSize: 120,
            fontWeight: 900,
            color: COLORS.accent,
            letterSpacing: -4,
            minWidth: 300,
            transform: shake(frame, end, 14, 12, done ? 1.2 : 0.5),
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {livePct >= 0 ? "+" : ""}
          {livePct}
          {"%"}
        </span>
      </div>

      <div style={{ position: "relative", width: W, height: H, marginTop: 20 }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.45} />
              <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          {[80, 90, 100, 110, 120].map((v) => (
            <g key={v}>
              <line x1={PAD.l} x2={W - PAD.r} y1={yOf(v)} y2={yOf(v)} stroke={COLORS.border} strokeWidth={2} />
            </g>
          ))}
          {/* Ligne du prix d'IPO */}
          <line
            x1={PAD.l}
            x2={PAD.l + (W - PAD.l - PAD.r) * interpolate(frame, [0, 14], [0, 1], clamp01)}
            y1={yOf(t.ipoPrice)}
            y2={yOf(t.ipoPrice)}
            stroke={COLORS.white}
            strokeWidth={3}
            strokeDasharray="14 12"
            opacity={0.6}
          />
          <path d={area} fill="url(#areaGrad)" />
          <path d={line} fill="none" stroke={COLORS.accent} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
          {prog > 0 ? (
            <>
              <circle cx={xOf(head.u)} cy={yOf(head.p)} r={22 + 6 * Math.sin(frame / 3)} fill={COLORS.accent} opacity={0.25} />
              <circle cx={xOf(head.u)} cy={yOf(head.p)} r={12} fill={COLORS.white} />
            </>
          ) : null}
          <text x={PAD.l} y={H - 8} fill={COLORS.muted} fontSize={28} fontWeight={700}>
            {t.timeStart}
          </text>
          <text x={W - PAD.r} y={H - 8} fill={COLORS.muted} fontSize={28} fontWeight={700} textAnchor="end">
            {t.timeEnd}
          </text>
        </svg>

        <Label x={PAD.l + 120} y={yOf(t.ipoPrice) + 14} show={ipoShow} title={t.ipoLabel} value={`${money(t.ipoPrice)}`} />
        <Label
          x={xOf(OPEN_U) + 30}
          y={yOf(t.openPrice) - 34}
          show={openShow}
          title={t.openLabel}
          value={`${money(t.openPrice, 2)} (+${pct(t.openPrice)}%)`}
          accent
        />
        <Label
          x={xOf(1) - 10}
          y={yOf(t.closePrice) + 50}
          show={closeShow}
          align="right"
          title={t.closeLabel}
          value={`${money(t.closePrice, 2)} (+${pct(t.closePrice)}%)`}
          accent
        />
      </div>

      <div style={{ display: "flex", gap: 20, marginTop: 30 }}>
        {stats.map((s, i) => {
          const sp = pop(frame, fps, s.at);
          return (
            <div
              key={i}
              style={{
                width: 300,
                padding: "20px 0",
                borderRadius: 24,
                background: COLORS.surface,
                border: `2px solid ${i === 2 ? COLORS.accent : COLORS.border}`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transform: `scale(${sp})`,
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 50, fontWeight: 900 }}>{s.value}</div>
              <div style={{ fontSize: 32, fontWeight: 800, color: COLORS.accent, minHeight: 40 }}>{s.delta}</div>
            </div>
          );
        })}
      </div>
    </SceneContainer>
  );
};
