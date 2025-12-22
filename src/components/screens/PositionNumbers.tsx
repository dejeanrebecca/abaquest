import { useState } from 'react';
import { Quest3PreTest } from '../quests/Quest3PreTest';
import { Quest3Learn } from '../quests/Quest3Learn';
import { Quest3Practice } from '../quests/Quest3Practice';
import { Quest3Story } from '../quests/Quest3Story';



interface PositionNumbersProps {
  onNext: (results?: { pre: number; post: number }) => void;
}


type Phase = 'pretest' | 'learn' | 'practice' | 'posttest' | 'story';

export function PositionNumbers({ onNext }: PositionNumbersProps) {
  const [phase, setPhase] = useState<Phase>('pretest');


  const handleNextPhase = (nextPhase?: Phase) => {
    if (nextPhase) {

      setPhase(nextPhase);
    } else {
      // Default flow
      if (phase === 'pretest') setPhase('learn');
      else if (phase === 'learn') setPhase('practice');
      else if (phase === 'practice') setPhase('posttest');
      else if (phase === 'story') {
        onNext({ pre: 100, post: 100 });
      }

    }
  };


  switch (phase) {
    case 'pretest':
      return <Quest3PreTest key="pretest" onComplete={() => handleNextPhase('learn')} />;
    case 'learn':
      return <Quest3Learn key="learn" onComplete={() => handleNextPhase('practice')} />;
    case 'practice':
      return <Quest3Practice key="practice" onComplete={() => handleNextPhase('posttest')} />;
    case 'posttest':
      return <Quest3PreTest key="posttest" isPostTest onComplete={() => handleNextPhase('story')} />;
    case 'story':
      return <Quest3Story key="story" onComplete={() => handleNextPhase()} />;
    default:
      return null;
  }
}