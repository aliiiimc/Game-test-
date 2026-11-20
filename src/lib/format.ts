/** Formate un nombre à la française : 1800 → « 1 800 », 93.5 → « 93,5 ». */
export const formatFr = (value: number, decimals = 0): string => {
  const fixed = value.toFixed(decimals);
  const [int, dec] = fixed.split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return dec ? `${grouped},${dec}` : grouped;
};

/** Normalise un mot pour comparer (minuscules, sans ponctuation). */
export const normalizeWord = (w: string): string =>
  w.toLowerCase().replace(/[.,!?;:«»"()]/g, "");

export const isHighlighted = (word: string, highlight: string[] = []) => {
  const n = normalizeWord(word);
  return highlight.some((h) => normalizeWord(h) === n);
};
