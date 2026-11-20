import { CalculateMetadataFunction, Composition } from "remotion";
import { TOTAL_FRAMES, VIDEO } from "./config";
import { Reel, ReelProps } from "./Reel";
import { NO_AUDIO, probeAllAudio } from "./lib/audio-probe";

/** Détecte les fichiers audio réellement présents avant le rendu. */
const calculateMetadata: CalculateMetadataFunction<ReelProps> = async ({ props }) => {
  const audio = await probeAllAudio();
  return { props: { ...props, audio }, durationInFrames: TOTAL_FRAMES };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id={VIDEO.id}
      component={Reel}
      durationInFrames={TOTAL_FRAMES}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{ audio: NO_AUDIO }}
      calculateMetadata={calculateMetadata}
    />
  );
};
