import { useState } from 'react';
import { Quest3PreTest } from '../quests/Quest3PreTest';
import { Quest3Explainer } from '../quests/Quest3Explainer';
import { Quest3Learn } from '../quests/Quest3Learn';
import { Quest3Practice } from '../quests/Quest3Practice';
import { Quest3Story } from '../quests/Quest3Story';
import { TransitionScreen } from '../common/TransitionScreen';

interface PositionNumbersProps {
  onNext: (results?: { pre: number; post: number }) => void;
}

type Phase = 'welcome' | 'pretest' | 'explainer' | 'learn' | 'practice' | 'story' | 'posttest' | 'close';

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
        case 'practice': setPhase('story'); break;
        case 'story': setPhase('posttest'); break;
        case 'posttest': setPhase('close'); break;
        case 'close': onNext({ pre: 100, post: 100 }); break; // TODO: Pass actual results
      }
    }
  };

  switch (phase) {
    case 'welcome':
      return (
        <TransitionScreen
          variant="learning"
          title="Quest 3: Position Numbers"
          subtitle="Let's learn where numbers live on the abacus!"
          onNext={() => handleNextPhase()}
          icon="123" // Using 123 as icon representation for numbers quest
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