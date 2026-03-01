import { useState } from 'react';
import { Quest3PreTest } from '../quests/Quest3PreTest';
import { Quest3Explainer } from '../quests/Quest3Explainer';
import { Quest3Learn } from '../quests/Quest3Learn';
import { Quest3Practice } from '../quests/Quest3Practice';
import { Quest3Story } from '../quests/Quest3Story';
import { TransitionScreen } from '../common/TransitionScreen';
import { QuestWelcome } from '../quest-screens/QuestWelcome';

interface PositionNumbersProps {
  onNext: (results?: { pre: number; post: number }) => void;
}

type Phase = 'welcome' | 'pretest' | 'explainer' | 'learn' | 'practice' | 'transition' | 'story' | 'posttest' | 'close';

export function PositionNumbers({ onNext }: PositionNumbersProps) {
  const [phase, setPhase] = useState<Phase>('welcome');

  const handleNextPhase = (nextPhase?: Phase) => {
    if (nextPhase) {
      setPhase(nextPhase);
    } else {
      // Default flow: welcome -> pretest -> explainer -> learn -> practice -> story -> posttest -> close
      switch (phase) {
        case 'welcome': setPhase('pretest'); break;
        case 'pretest': setPhase('explainer'); break;
        case 'explainer': setPhase('learn'); break;
        case 'learn': setPhase('practice'); break;
        case 'practice': setPhase('transition'); break;
        case 'transition': setPhase('story'); break;
        case 'story': setPhase('posttest'); break;
        case 'posttest': setPhase('close'); break;
        case 'close': onNext({ pre: 100, post: 100 }); break; // TODO: Pass actual results
      }
    }
  };

  switch (phase) {
    case 'welcome':
      return (
        <QuestWelcome
          key="welcome"
          questTitle="Quest 3: Position Numbers"
          questIcon="123"
          welcomeMessage="Great work so far, AbaQuester! Now that you know the parts of your Junior Counter, it's time to find out where the numbers 0 to 9 live. Every number has its own special place!"
          audioWelcomeMessage="Great work so far, AbaQuester! Now that you know the parts of your Junior Counter, it's time to find out where the numbers 0 to 9 liv. Every number has its own special place!"
          onNext={() => handleNextPhase()}
          showEmotionalCheckIn={false}
        />
      );
    case 'pretest':
      return <Quest3PreTest key="pretest" onComplete={() => handleNextPhase()} />;
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
      return <Quest3PreTest key="posttest" isPostTest onComplete={() => handleNextPhase()} />;
    case 'close':
      return (
        <TransitionScreen
          variant="default" // Default is yellow/success style
          title="Quest Complete!"
          subtitle="You've mastered number positions! Great job!"
          onNext={() => handleNextPhase()}
        />
      );
    default:
      return null;
  }
}