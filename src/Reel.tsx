import { AbsoluteFill, Sequence } from "remotion";
import { COLORS, SceneId, SCENE_ORDER, sceneDurationFrames, sceneStartFrame } from "./config";
import { FONT_FAMILY } from "./lib/fonts";
import { AudioAvailability } from "./lib/audio-probe";
import { Background } from "./components/Background";
import { Header } from "./components/Header";
import { Subtitles } from "./components/Subtitles";
import { TransitionWipe } from "./components/TransitionWipe";
import { AudioLayer } from "./components/AudioLayer";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Nasdaq } from "./scenes/Scene2Nasdaq";
import { Scene3Raise } from "./scenes/Scene3Raise";
import { Scene4Investors } from "./scenes/Scene4Investors";
import { Scene5FirstDay } from "./scenes/Scene5FirstDay";
import { Scene6Valuation } from "./scenes/Scene6Valuation";
import { Scene7Outro } from "./scenes/Scene7Outro";
import { SceneDrop } from "./scenes/SceneDrop";
import { SceneWhy } from "./scenes/SceneWhy";

const SCENES: Record<SceneId, React.FC> = {
  intro: Scene1Intro,
  nasdaq: Scene2Nasdaq,
  raise: Scene3Raise,
  investors: Scene4Investors,
  firstDay: Scene5FirstDay,
  valuation: Scene6Valuation,
  drop: SceneDrop,
  why: SceneWhy,
  outro: Scene7Outro,
};

export type ReelProps = { audio: AudioAvailability };

export const Reel: React.FC<ReelProps> = ({ audio }) => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT_FAMILY, color: COLORS.white, backgroundColor: COLORS.bg }}>
      <Background />
      {SCENE_ORDER.map((id) => {
        const Scene = SCENES[id];
        return (
          <Sequence key={id} name={id} from={sceneStartFrame(id)} durationInFrames={sceneDurationFrames(id)}>
            <Scene />
          </Sequence>
        );
      })}
      <Header />
      <Subtitles />
      <TransitionWipe />
      <AudioLayer audio={audio} />
    </AbsoluteFill>
  );
};
