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
} as const;

// ── Durées des scènes (en secondes) ─────────────────────────
// Changez une valeur ici : la timeline, les sous-titres et l'audio suivent.
export const SCENE_DURATIONS = {
  intro: 4, // 1. La plus grosse IPO
  nasdaq: 5, // 2. Entrée au Nasdaq + ticker
  raise: 5, // 3. 93,5 Md$ levés
  investors: 5, // 4. Bulles investisseurs
  firstDay: 5, // 5. Courbe du premier jour
  valuation: 4, // 6. Valorisation ~1 800 Md$
  outro: 4, // 7. Bulle ou révolution ?
} as const;

export type SceneId = keyof typeof SCENE_DURATIONS;

export const SCENE_ORDER: SceneId[] = [
  "intro",
  "nasdaq",
  "raise",
  "investors",
  "firstDay",
  "valuation",
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
    end: 3.6,
    text: "La plus grosse introduction en bourse de l'histoire vient d'arriver.",
  },
  nasdaq: {
    start: 0.2,
    end: 3.4,
    text: "Anthropic, le créateur de Claude, est entré au Nasdaq.",
  },
  raise: {
    start: 0.3,
    end: 3.6,
    text: "93,5 milliards de dollars levés, plus que SpaceX.",
  },
  investors: {
    start: 0.3,
    end: 3.8,
    text: "Google, Microsoft et Nvidia ont ajouté 26 milliards.",
  },
  firstDay: {
    start: 0.3,
    end: 2.2,
    text: "Premier jour : plus 17\u00A0%.",
  },
  valuation: {
    start: 0.2,
    end: 3.6,
    text: "Valeur de l'entreprise : environ 1\u00A0800 milliards de dollars.",
  },
  outro: {
    start: 0.2,
    end: 2.2,
    text: "Alors, bulle ou révolution\u00A0?",
  },
};

// ── Textes à l'écran ────────────────────────────────────────
export const CLUB_NAME = "[Club finance]";
export const COLLAB = `CGI ENSA Marrakech x ${CLUB_NAME}`;

export const TEXTS = {
  header: { left: COLLAB, right: "IPO • NOV. 2026" },
  intro: {
    badge: "BREAKING • NOVEMBRE 2026",
    title: "La plus grosse IPO de l'histoire vient d'arriver.",
    highlight: ["IPO", "l'histoire"],
    note: "IPO = introduction en bourse",
  },
  nasdaq: {
    title: "Anthropic, créateur de Claude, entre au Nasdaq",
    highlight: ["Nasdaq"],
    exchange: "NASDAQ",
    ticker: "ANT",
    tickerCaption: "Nouvelle cotation",
    tape: ["ANT", "NOUVELLE COTATION", "NASDAQ", "IPO RECORD", "NOV. 2026"],
  },
  raise: {
    label: "MONTANT LEVÉ",
    value: 93.5,
    decimals: 1,
    unit: "milliards $",
    sub: "Plus que SpaceX en juin.",
    subHighlight: ["SpaceX"],
  },
  investors: {
    title: "Les géants de la tech remettent au pot",
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
    extra: "+ 26 milliards $",
    totalLabel: "TOTAL LEVÉ",
    totalFrom: 93.5,
    total: 119.5,
    totalUnit: "milliards $",
  },
  firstDay: {
    title: "Premier jour",
    ipoPrice: 83,
    openPrice: 111.5,
    closePrice: 97.17,
    ipoLabel: "Prix IPO",
    openLabel: "Ouverture",
    closeLabel: "Clôture",
    timeStart: "9h30",
    timeEnd: "16h00",
  },
  valuation: {
    label: "VALORISATION",
    prefix: "~",
    value: 1800,
    unit: "milliards $",
    compare: "au niveau de Meta",
    compareHighlight: ["Meta"],
    barA: "Anthropic",
    barB: "Meta",
    note: "Valorisation = prix de l'action × nombre d'actions",
  },
  outro: {
    word1: "Bulle",
    word2: "ou",
    word3: "révolution ?",
    cta: "Dis-nous en commentaire",
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
