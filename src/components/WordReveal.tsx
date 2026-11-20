import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../config";
import { clamp01, pop } from "../lib/anim";
import { isHighlighted } from "../lib/format";

type Props = {
  text: string;
  highlight?: string[];
  /** Délai avant le premier mot (frames). */
  delay?: number;
  /** Écart entre deux mots (frames). */
  stagger?: number;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  align?: "left" | "center";
  lineHeight?: number;
  maxWidth?: number;
};

/** Texte qui apparaît mot par mot (spring + léger flou). */
export const WordReveal: React.FC<Props> = ({
  text,
  highlight = [],
  delay = 0,
  stagger = 3,
  fontSize = 110,
  fontWeight = 900,
  color = COLORS.white,
  align = "center",
  lineHeight = 1.08,
  maxWidth = 940,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        columnGap: fontSize * 0.26,
        rowGap: fontSize * (lineHeight - 1),
        maxWidth,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing: -fontSize * 0.02,
        textAlign: align,
      }}
    >
      {words.map((w, i) => {
        const start = delay + i * stagger;
        const s = pop(frame, fps, start, { damping: 12, mass: 0.6, stiffness: 160 });
        const blur = interpolate(frame, [start, start + 6], [10, 0], clamp01);
        const hl = isHighlighted(w, highlight);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(s, [0, 0.6], [0, 1], clamp01),
              transform: `translateY(${(1 - s) * 70}px) scale(${0.85 + 0.15 * s})`,
              filter: `blur(${blur}px)`,
              color: hl ? COLORS.accent : color,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
