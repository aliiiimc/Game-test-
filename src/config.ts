/**
 * ─────────────────────────────────────────────────────────────
 *  CONFIGURATION CENTRALE DU REEL « IPO ANTHROPIC »
 *  Textes, couleurs, durées, timings voix off et audio.
 *  Modifiez ce fichier : tout le reste s'adapte automatiquement.
 * ─────────────────────────────────────────────────────────────
 */

// ── Format ──────────────────────────────────────────────────
export const VIDEO = {
  id: "AnthropicIPO",
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

/** Marge de sécurité (px) en haut et en bas pour l'interface Instagram. */
export const SAFE_MARGIN = 250;

// ── Couleurs ────────────────────────────────────────────────
export const COLORS = {
  bg: "#0E0E10",
  accent: "#FF6B2C",
  accentSoft: "rgba(255, 107, 44, 0.16)",
  white: "#FFFFFF",
  muted: "#8B8B95",
  surface: "#17171B",
  border: "rgba(255, 255, 255, 0.10)",
  grid: "rgba(255, 255, 255, 0.045)",
  subtitleBg: "rgba(14, 14, 16, 0.78)",
  negative: "#FF4D4D",
} as const;

// ── Durées des scènes (en secondes) ─────────────────────────
// Changez une valeur ici : la timeline, les sous-titres et l'audio suivent.
export const SCENE_DURATIONS = {
  intro: 4, // 1. La plus grosse IPO
  nasdaq: 5, // 2. Entrée au Nasdaq + ticker
  raise: 5, // 3. 93,5 Md$ levés
  investors: 5, // 4. Bulles investisseurs
  firstDay: 5, // 5. Courbe du premier jour
  valuation: 4, // 6. Valorisation $1.76T
  drop: 5, // 7. La chute sous le prix d'IPO
  why: 5, // 8. Pourquoi ça a chuté
  outro: 4, // 9. Bulle ou révolution ?
} as const;

export type SceneId = keyof typeof SCENE_DURATIONS;

export const SCENE_ORDER: SceneId[] = [
  "intro",
  "nasdaq",
  "raise",
  "investors",
  "firstDay",
  "valuation",
  "drop",
  "why",
  "outro",
];

// ── Voix off & sous-titres ──────────────────────────────────
// `start` / `end` : secondes RELATIVES au début de la scène, telles qu'elles
// apparaissent dans public/voiceover.mp3 (un seul fichier pour toute la vidéo).
// Ajustez-les quand vous aurez le vrai enregistrement : les sous-titres
// (surlignage mot par mot) et la baisse de la musique se recalent seuls.
export const VOICEOVER: Record<
  SceneId,
  { start: number; end: number; text: string }
> = {
  intro: {
    start: 0.2,
    end: 3.4,
    text: "The biggest IPO in history just happened.",
  },
  nasdaq: {
    start: 0.2,
    end: 3.4,
    text: "Anthropic, the company behind Claude, just listed on the Nasdaq.",
  },
  raise: {
    start: 0.3,
    end: 3.6,
    text: "$93.5 billion raised, more than SpaceX.",
  },
  investors: {
    start: 0.3,
    end: 3.8,
    text: "Google, Microsoft and Nvidia added another $26 billion.",
  },
  firstDay: {
    start: 0.3,
    end: 2.2,
    text: "Day one: up 17%.",
  },
  valuation: {
    start: 0.2,
    end: 3.6,
    text: "Day-one value: $1.76 trillion, nearly double May's valuation.",
  },
  drop: {
    start: 0.2,
    end: 4.2,
    text: "Then came the fall: below its $83 IPO price by day four.",
  },
  why: {
    start: 0.2,
    end: 4.6,
    text: "Why? Profit-taking, no more bank support, an AI sell-off and a sky-high price.",
  },
  outro: {
    start: 0.2,
    end: 2.2,
    text: "So, bubble or revolution?",
  },
};

// ── Textes à l'écran (anglais) ──────────────────────────────
export const COLLAB = "CGI x Finova";

export const TEXTS = {
  header: { left: COLLAB, right: "IPO • NOV. 2026" },
  intro: {
    badge: "BREAKING • NOVEMBER 2026",
    title: "The biggest IPO in history just happened.",
    highlight: ["IPO", "history"],
    note: "IPO = Initial Public Offering",
  },
  nasdaq: {
    title: "Anthropic, the maker of Claude, goes public on Nasdaq",
    highlight: ["Nasdaq"],
    exchange: "NASDAQ",
    ticker: "ANT",
    tickerCaption: "Newly listed",
    tape: ["ANT", "NEW LISTING", "NASDAQ", "RECORD IPO", "NOV. 2026"],
  },
  raise: {
    label: "AMOUNT RAISED",
    value: 93.5,
    decimals: 1,
    unit: "billion",
    sub: "More than SpaceX in June.",
    subHighlight: ["SpaceX"],
  },
  investors: {
    title: "Big Tech chips in",
    companies: [
      "Google",
      "Microsoft",
      "Nvidia",
      "AMD",
      "TSMC",
      "Broadcom",
      "Micron",
    ],
    /** Sociétés mises en avant (citées par la voix off). */
    featured: ["Google", "Microsoft", "Nvidia"],
    extra: "+ $26 billion",
    totalLabel: "TOTAL RAISED",
    totalFrom: 93.5,
    total: 119.5,
    totalUnit: "billion",
  },
  firstDay: {
    title: "Day one",
    ipoPrice: 83,
    openPrice: 111.5,
    closePrice: 97.17,
    ipoLabel: "IPO price",
    openLabel: "Open",
    closeLabel: "Close",
    timeStart: "9:30 AM",
    timeEnd: "4:00 PM",
  },
  valuation: {
    label: "VALUATION AT DAY-ONE CLOSE",
    prefix: "",
    currency: "$",
    value: 1.76,
    decimals: 2,
    unit: "trillion",
    compare: "nearly 2× its May valuation",
    compareHighlight: ["2×"],
    /** Barre A : valorisation privée de mai 2026 (Series H). */
    barA: "May 2026",
    barAValue: 0.965,
    barAText: "$965B",
    /** Barre B : valorisation à la clôture du 1er jour. */
    barB: "Day one",
    barBValue: 1.76,
    barBText: "$1.76T",
    note: "Valuation = share price × number of shares",
  },
  drop: {
    title: "Then came the drop",
    change: -36, // vs plus haut du 1er jour
    changeCaption: "vs. day-one high ($114.99)",
    ipoPrice: 83,
    ipoLabel: "IPO price $83",
    /** Cours de clôture (sauf * = cours intrajournalier). */
    bars: [
      { label: "Nov 19", value: 97.17 },
      { label: "Nov 20", value: 88.91 },
      { label: "Nov 24", value: 81.91 },
      { label: "Nov 25*", value: 74 },
    ],
    footnote: "- - - IPO price $83 · Closing prices · *Nov 25: intraday",
    caption: "Below the IPO price on day 4",
  },
  why: {
    title: "Why the fall?",
    reasons: [
      { title: "Profit-taking", detail: "Early buyers cashed in after the +34% pop" },
      { title: "Safety net gone", detail: "Banks used the greenshoe on day 1: no buyer left at $83" },
      { title: "AI sell-off", detail: "Tech stocks retreated: Nasdaq -2.3% on day one" },
      { title: "Steep price tag", detail: "~30× sales: investors question the valuation" },
    ],
  },
  outro: {
    word1: "Bubble",
    word2: "or",
    word3: "revolution?",
    cta: "Tell us in the comments",
    collab: COLLAB,
  },
};

// ── Audio ───────────────────────────────────────────────────
// Fichiers dans public/. S'ils sont absents, vides ou illisibles,
// ils sont simplement ignorés (la vidéo se génère quand même).
export const AUDIO_FILES = {
  voiceover: "voiceover.mp3",
  music: "music.mp3",
  whoosh: "whoosh.mp3",
  tick: "tick.mp3",
  impact: "impact.mp3",
} as const;

export type AudioKey = keyof typeof AUDIO_FILES;

export const AUDIO = {
  voiceVolume: 1,
  music: {
    volume: 0.3, // volume normal
    duckedVolume: 0.1, // pendant la voix off
    duckRampSeconds: 0.25, // durée du glissement 30 % ↔ 10 %
    fadeInSeconds: 1.5,
    fadeOutSeconds: 2,
  },
  whoosh: {
    volume: 0.7,
    /** Décalage par rapport à la transition (négatif = un peu avant). */
    offsetSeconds: -0.15,
  },
  tick: { volume: 0.5 },
  impact: { volume: 1 },
};

// ── Timings d'animation internes (secondes, relatifs à la scène) ──
export const TIMINGS = {
  raise: { counterStart: 0.4, counterDuration: 2.2, subAt: 2.9 },
  investors: {
    bubblesStart: 0.2,
    bubbleStagger: 0.18,
    extraAt: 2.3,
    totalAt: 3.2,
  },
  firstDay: { chartStart: 0.4, chartDuration: 2.8 },
  valuation: { counterStart: 0.2, counterDuration: 1.4, barsAt: 1.7 },
  drop: { counterStart: 0.3, counterDuration: 1.2, barsStart: 0.6, barStagger: 0.35 },
  why: { cardsStart: 0.5, cardStagger: 0.9 },
  outro: { questionAt: 0.15, ctaAt: 1.7, collabAt: 2.4 },
  transitionFrames: 10,
};

// ── Helpers dérivés (ne pas modifier) ───────────────────────
export const sec = (s: number): number => Math.round(s * VIDEO.fps);

export const sceneStartSeconds = (id: SceneId): number => {
  let t = 0;
  for (const s of SCENE_ORDER) {
    if (s === id) return t;
    t += SCENE_DURATIONS[s];
  }
  return t;
};

export const sceneStartFrame = (id: SceneId): number =>
  sec(sceneStartSeconds(id));

export const sceneDurationFrames = (id: SceneId): number =>
  sec(SCENE_DURATIONS[id]);

export const TOTAL_SECONDS = SCENE_ORDER.reduce(
  (acc, s) => acc + SCENE_DURATIONS[s],
  0,
);

export const TOTAL_FRAMES = sec(TOTAL_SECONDS);
