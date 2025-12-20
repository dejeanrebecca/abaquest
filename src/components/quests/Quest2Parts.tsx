import { useState } from 'react';
import { QuestWelcome } from '../quest-screens/QuestWelcome';
import { QuestClose } from '../quest-screens/QuestClose';
import { Quest2Assessment } from './Quest2Assessment';
import { Quest2Learn } from './Quest2Learn';
import { Quest2Story } from './Quest2Story';
import { useQuestEngine } from '../QuestEngine';

interface Quest2PartsProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'pretest' | 'learn' | 'story' | 'posttest' | 'close';

export function Quest2Parts({ onComplete }: Quest2PartsProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [preTestScore, setPreTestScore] = useState(0);
  const [postTestScore, setPostTestScore] = useState(0);

  const { completeQuest } = useQuestEngine();

  const calculateScore = (answers: boolean[]): number => {
    if (answers.length === 0) return 0;
    const correct = answers.filter(a => a).length;
    return Math.round((correct / answers.length) * 100);
  };

  const handlePreTestComplete = (answers: boolean[]) => {
    const score = calculateScore(answers);
    setPreTestScore(score);
    setStep('learn');
  };

  const handlePostTestComplete = (answers: boolean[]) => {
    const score = calculateScore(answers);
    setPostTestScore(score);
    setStep('close');
  };

  // STEP 1: WELCOME
  if (step === 'welcome') {
    return (
      <QuestWelcome
        questTitle="Quest 2: Parts of the Counter"
        questIcon="🧩"
        welcomeMessage="Great work so far, AbaQuester! Now that you've named your Junior Counter, it's time to learn about its special parts. Every part has a job to do — and they all work together to help you think about numbers!"
        onNext={() => setStep('pretest')}
        showEmotionalCheckIn={false}
      />
    );
  }

  // STEP 2: PRE-TEST
  if (step === 'pretest') {
    return (
      <Quest2Assessment
        type="pretest"
        onComplete={handlePreTestComplete}
      />
    );
  }

  // STEP 3: MINI-LESSON
  if (step === 'learn') {
    return <Quest2Learn onComplete={() => setStep('story')} />;
  }

  // STEP 4: STORY MODE
  if (step === 'story') {
    return <Quest2Story onComplete={() => setStep('posttest')} />;
  }

  // STEP 5: POST-TEST
  if (step === 'posttest') {
    return (
      <Quest2Assessment
        type="posttest"
        onComplete={handlePostTestComplete}
      />
    );
  }

  // STEP 6: CLOSE
  if (step === 'close') {
    const learningGain = postTestScore - preTestScore;

    return (
      <QuestClose
        questTitle="Quest 2: Parts of the Counter"
        questIcon="🧩"
        preTestScore={preTestScore}
        postTestScore={postTestScore}
        coinsEarned={25}
        learningGain={learningGain}
        summary="You've mastered the three parts of your Junior Counter: the Upper Bead (Head), Lower Beads (Legs), and Answer Rod (Body)! Now you're ready to learn how numbers live on your counter!"
        onNext={() => {
          completeQuest(preTestScore, postTestScore);
          onComplete();
        }}
      />
    );
  }

  return null;
}