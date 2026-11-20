import { staticFile } from "remotion";
import { AUDIO_FILES, AudioKey } from "../config";

export type AudioAvailability = Record<AudioKey, boolean>;

export const NO_AUDIO: AudioAvailability = {
  voiceover: false,
  music: false,
  whoosh: false,
  tick: false,
  impact: false,
};

/**
 * Vérifie qu'un fichier audio de public/ existe, n'est pas vide et
 * peut être décodé par le navigateur. Ne lève jamais d'erreur.
 */
const probe = async (file: string): Promise<boolean> => {
  try {
    const src = staticFile(file);
    const res = await fetch(src);
    if (!res.ok) return false;
    const buf = await res.arrayBuffer();
    if (buf.byteLength < 256) return false; // fichier vide / placeholder

    return await new Promise<boolean>((resolve) => {
      const el = document.createElement("audio");
      const done = (ok: boolean) => {
        clearTimeout(timer);
        el.removeAttribute("src");
        resolve(ok);
      };
      const timer = setTimeout(() => done(false), 8000);
      el.preload = "metadata";
      el.onloadedmetadata = () => done(Number.isFinite(el.duration) && el.duration > 0);
      el.onerror = () => done(false);
      el.src = src;
    });
  } catch {
    return false;
  }
};

export const probeAllAudio = async (): Promise<AudioAvailability> => {
  const keys = Object.keys(AUDIO_FILES) as AudioKey[];
  const results = await Promise.all(keys.map((k) => probe(AUDIO_FILES[k])));
  const out: AudioAvailability = { ...NO_AUDIO };
  keys.forEach((k, i) => {
    out[k] = results[i];
  });
  return out;
};
