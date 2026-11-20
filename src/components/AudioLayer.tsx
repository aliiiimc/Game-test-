import { Audio, interpolate, Sequence, staticFile } from "remotion";
import {
  AUDIO,
  AUDIO_FILES,
  SCENE_ORDER,
  TIMINGS,
  TOTAL_FRAMES,
  VOICEOVER,
  sceneStartSeconds,
  sec,
} from "../config";
import { AudioAvailability } from "../lib/audio-probe";
import { clamp01 } from "../lib/anim";

/** Segments (en frames absolues) où la voix off parle. */
const voiceSegments = SCENE_ORDER.map((id) => {
  const s = sceneStartSeconds(id);
  return [sec(s + VOICEOVER[id].start), sec(s + VOICEOVER[id].end)] as const;
});

/** Volume de la musique : fondu entrée/sortie + ducking pendant la voix. */
const musicVolume = (frame: number, ducking: boolean): number => {
  const m = AUDIO.music;
  const fadeIn = interpolate(frame, [0, sec(m.fadeInSeconds)], [0, 1], clamp01);
  const fadeOut = interpolate(
    frame,
    [TOTAL_FRAMES - sec(m.fadeOutSeconds), TOTAL_FRAMES],
    [1, 0],
    clamp01,
  );

  let level = m.volume;
  if (ducking) {
    const ramp = Math.max(1, sec(m.duckRampSeconds));
    // 1 = voix active, 0 = pas de voix ; transition douce sur `ramp` frames.
    let duck = 0;
    for (const [a, b] of voiceSegments) {
      const d = interpolate(frame, [a - ramp, a, b, b + ramp], [0, 1, 1, 0], clamp01);
      duck = Math.max(duck, d);
    }
    level = m.volume + (m.duckedVolume - m.volume) * duck;
  }
  return level * fadeIn * fadeOut;
};

const SFX: React.FC<{ file: string; at: number; volume: number; name: string }> = ({
  file,
  at,
  volume,
  name,
}) => (
  <Sequence from={Math.max(0, at)} durationInFrames={sec(3)} name={name} layout="none">
    <Audio src={staticFile(file)} volume={volume} />
  </Sequence>
);

/** Toutes les pistes audio. Un fichier indisponible n'est pas monté. */
export const AudioLayer: React.FC<{ audio: AudioAvailability }> = ({ audio }) => {
  const raiseStart = sceneStartSeconds("raise");
  const outroStart = sceneStartSeconds("outro");
  const r = TIMINGS.raise;

  return (
    <>
      {audio.voiceover ? (
        <Audio src={staticFile(AUDIO_FILES.voiceover)} volume={AUDIO.voiceVolume} name="Voix off" />
      ) : null}

      {audio.music ? (
        <Audio
          src={staticFile(AUDIO_FILES.music)}
          loop
          name="Musique"
          volume={(f) => musicVolume(f, audio.voiceover)}
        />
      ) : null}

      {audio.whoosh
        ? SCENE_ORDER.slice(1).map((id) => (
            <SFX
              key={id}
              name={`Whoosh → ${id}`}
              file={AUDIO_FILES.whoosh}
              at={sec(sceneStartSeconds(id) + AUDIO.whoosh.offsetSeconds)}
              volume={AUDIO.whoosh.volume}
            />
          ))
        : null}

      {audio.tick ? (
        <Sequence
          from={sec(raiseStart + r.counterStart)}
          durationInFrames={sec(r.counterDuration)}
          name="Tick compteur"
          layout="none"
        >
          <Audio src={staticFile(AUDIO_FILES.tick)} loop volume={AUDIO.tick.volume} />
        </Sequence>
      ) : null}

      {audio.impact ? (
        <>
          <SFX
            name="Impact 93,5 Md"
            file={AUDIO_FILES.impact}
            at={sec(raiseStart + r.counterStart + r.counterDuration)}
            volume={AUDIO.impact.volume}
          />
          <SFX
            name="Impact Bulle ou révolution"
            file={AUDIO_FILES.impact}
            at={sec(outroStart + TIMINGS.outro.questionAt)}
            volume={AUDIO.impact.volume}
          />
        </>
      ) : null}
    </>
  );
};
