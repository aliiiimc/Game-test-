import { interpolate, spring, SpringConfig } from "remotion";

export const pop = (
  frame: number,
  fps: number,
  delay = 0,
  config: Partial<SpringConfig> = { damping: 13, mass: 0.7, stiffness: 140 },
) => spring({ frame: frame - delay, fps, config });

/** Vibration : forte juste après `trigger`, puis micro-vibration continue. */
export const shake = (
  frame: number,
  trigger: number,
  intensity = 14,
  duration = 12,
  idle = 1.2,
): string => {
  const f = frame - trigger;
  if (f < 0) return "translate(0px, 0px)";
  const decay = f < duration ? intensity * (1 - f / duration) : 0;
  const amp = decay + idle;
  const x = Math.sin(f * 2.9) * amp;
  const y = Math.cos(f * 3.7) * amp * 0.7;
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
};

export const clamp01 = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const fadeIn = (frame: number, start: number, dur = 8) =>
  interpolate(frame, [start, start + dur], [0, 1], clamp01);
