import { useState, useEffect } from 'react';
import { Quest3PreTest } from '../quests/Quest3PreTest';
import { Quest3Explainer } from '../quests/Quest3Explainer';
import { Quest3Learn } from '../quests/Quest3Learn';
import { Quest3Practice } from '../quests/Quest3Practice';
import { Quest3Story } from '../quests/Quest3Story';
import { TransitionScreen } from '../common/TransitionScreen';
import { QuestWelcome } from '../quest-screens/QuestWelcome';
import { useElevenLabs } from '../../hooks/useElevenLabs';
import { useQuestEngine } from '../QuestEngine';
import { QuestClose } from '../quest-screens/QuestClose';

interface PositionNumbersProps {
  onNext: (results?: { pre: number; post: number }) => void;
}

type Phase = 'welcome' | 'pretest' | 'explainer' | 'learn' | 'practice' | 'transition' | 'story' | 'posttest' | 'close';

export function PositionNumbers({ onNext }: PositionNumbersProps) {
  const { currentStep, goToStep } = useQuestEngine();
  const [phase, setPhaseState] = useState<Phase>((currentStep as Phase) || 'welcome');
  const [preTestScore, setPreTestScore] = useState(0);
  const [postTestScore, setPostTestScore] = useState(0);
  const { stopAudio } = useElevenLabs();

  // Ensure audio stops when navigating away from the quest
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  const calculateScore = (answers: boolean[]): number => {
    if (answers.length === 0) return 100;
    const correct = answers.filter(a => a).length;
    return Math.round((correct / answers.length) * 100);
  };

  const handleNextPhase = (nextPhase?: Phase, answers?: boolean[]) => {
    let newPhase = nextPhase;

    if (phase === 'pretest' && answers) {
      setPreTestScore(calculateScore(answers));
    } else if (phase === 'posttest' && answers) {
      setPostTestScore(calculateScore(answers));
    }

    if (!newPhase) {
      // Default flow: welcome -> pretest -> explainer -> learn -> practice -> story -> posttest -> close
      switch (phase) {
        case 'welcome': newPhase = 'pretest'; break;
        case 'pretest': newPhase = 'explainer'; break;
        case 'explainer': newPhase = 'learn'; break;
        case 'learn': newPhase = 'practice'; break;
        case 'practice': newPhase = 'transition'; break;
        case 'transition': newPhase = 'story'; break;
        case 'story': newPhase = 'posttest'; break;
        case 'posttest': newPhase = 'close'; break;
        case 'close': onNext({ pre: preTestScore, post: postTestScore }); return;
      }
    }
    if (newPhase) {
      setPhaseState(newPhase);
      if (['welcome', 'pretest', 'learn', 'story', 'posttest', 'close'].includes(newPhase)) {
        goToStep(newPhase as any);
      }
    }
  };

  switch (phase) {
    case 'welcome':
      return (
        <QuestWelcome
          key="welcome"
          questTitle="Quest 3: Position Numbers"
          questIcon="🔢"
          welcomeMessage="Great work so far, AbaQuester! Now that you know the parts of your Junior Counter, it's time to find out where the numbers 0 to 9 live. Every number has its own special place!"
          audioKey="q3_welcome_msg"
          onNext={() => handleNextPhase()}
          showEmotionalCheckIn={false}
        />
      );
    case 'pretest':
      return <Quest3PreTest key="pretest" onComplete={(answers) => handleNextPhase(undefined, answers)} />;
    case 'explainer':
      return <Quest3Explainer onComplete={() => handleNextPhase()} />;
    case 'learn':
      return <Quest3Learn key="learn" onComplete={() => handleNextPhase()} />;
    case 'practice':
      return <Quest3Practice key="practice" onComplete={() => handleNextPhase()} />;
    case 'transition':
      return (
        <TransitionScreen
          key="transition"
          title="Story Time!"
          subtitle="Let's join Ameer and Ameerah on their adventure."
          onNext={() => handleNextPhase()}
          variant="story"
          showBookIcon={true}
          buttonText="Let's Read!"
        />
      );
    case 'story':
      return <Quest3Story key="story" onComplete={() => handleNextPhase()} />;
    case 'posttest':
      return <Quest3PreTest key="posttest" isPostTest onComplete={(answers) => handleNextPhase(undefined, answers)} />;
    case 'close':
      return (
        <QuestClose
          questTitle="Quest 3: Position Numbers"
          questIcon="🔢"
          preTestScore={preTestScore}
          postTestScore={postTestScore}
          coinsEarned={30}
          learningGain={postTestScore - preTestScore}
          summary="You've mastered number positions! You now know exactly where every number from 0 to 9 lives on your Junior Counter. Great job!"
          onNext={() => handleNextPhase()}
          nextButtonText="Continue to Library! 🏛️"
        />
      );
    default:
      return null;
  }
}