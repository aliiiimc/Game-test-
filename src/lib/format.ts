/** Formats a number in English: 1800 -> "1,800", 93.5 -> "93.5". */
export const formatNum = (value: number, decimals = 0): string => {
  const fixed = value.toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${grouped}.${dec}` : grouped;
};

/** Dollar amount: money(97.17, 2) -> "$97.17". */
export const money = (value: number, decimals = 0): string =>
  `$${formatNum(value, decimals)}`;

/** Normalizes a word for comparison (lowercase, no punctuation). */
export const normalizeWord = (w: string): string =>
  w.toLowerCase().replace(/[.,!?;:"()]/g, "");

export const isHighlighted = (word: string, highlight: string[] = []) => {
  const n = normalizeWord(word);
  return highlight.some((h) => normalizeWord(h) === n);
};
