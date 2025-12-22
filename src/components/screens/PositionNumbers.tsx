import { useState } from 'react';
import { Quest3PreTest } from '../quests/Quest3PreTest';
import { Quest3Learn } from '../quests/Quest3Learn';
import { Quest3Practice } from '../quests/Quest3Practice';
import { Quest3Story } from '../quests/Quest3Story';
import { useQuestEngine } from '../QuestEngine';


interface PositionNumbersProps {
  onNext: () => void;
}

type Phase = 'pretest' | 'learn' | 'practice' | 'posttest' | 'story';

export function PositionNumbers({ onNext }: PositionNumbersProps) {
  const [phase, setPhase] = useState<Phase>('pretest');
  const { completeQuest } = useQuestEngine();

  const handleNextPhase = (nextPhase?: Phase) => {
    if (nextPhase) {

      setPhase(nextPhase);
    } else {
      // Default flow
      if (phase === 'pretest') setPhase('learn');
      else if (phase === 'learn') setPhase('practice');
      else if (phase === 'practice') setPhase('posttest');
      else if (phase === 'posttest') setPhase('story');
      else if (phase === 'story') {
        completeQuest(100, 100); // Placeholder scores until we implement scoring bubbling
        onNext();
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