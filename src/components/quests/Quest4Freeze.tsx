import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { QuestWelcome } from '../quest-screens/QuestWelcome';
import { QuestClose } from '../quest-screens/QuestClose';
import { PostTestCheckIn } from '../quest-screens/PostTestCheckIn';
import { TransitionScreen } from '../common/TransitionScreen';
import { useDataLogger } from '../DataLogger';
import { useElevenLabs } from '../../hooks/useElevenLabs';
import { useQuestEngine } from '../QuestEngine';

// Placeholder imports for components we are about to create
import { Quest4PreTest } from './Quest4PreTest';
import { Quest4Explainer } from './Quest4Explainer';
import { Quest4Learn } from './Quest4Learn';
import { Quest4Practice } from './Quest4Practice';
import { Quest4Story } from './Quest4Story';

export type QuestStep =
  | 'welcome'
  | 'pretest-transition'
  | 'pretest'
  | 'explainer'
  | 'learn'
  | 'practice'
  | 'story-transition'
  | 'story'
  | 'posttest-transition'
  | 'posttest'
  | 'close';

interface Quest4FreezeProps {
  onComplete: (results?: { pre: number; post: number }) => void;
}

export function Quest4Freeze({ onComplete }: Quest4FreezeProps) {
  const { currentStep, goToStep } = useQuestEngine();
  const [step, setStepState] = useState<QuestStep>((currentStep as QuestStep) || 'welcome');

  const setStep = (newStep: QuestStep) => {
    setStepState(newStep);
    if (['welcome', 'pretest', 'learn', 'story', 'posttest', 'close'].includes(newStep)) {
      goToStep(newStep as any);
    }
  };

  const [preTestScore, setPreTestScore] = useState(0);
  const [postTestScore, setPostTestScore] = useState(0);
  const { logInteraction } = useDataLogger();

  const { stopAudio } = useElevenLabs();

  // Ensure audio stops when navigating away from the quest
  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  const handlePreTestComplete = (score: number) => {
    setPreTestScore(score);
    logInteraction({
      quest_id: 4,
      scene_id: 'pre_test_complete',
      interaction_type: 'pre_test',
      correct_flag: true,
      time_ms: 0,
      number: null,
      student_response: score.toString()
    });
    setStep('explainer');
  };

  const handlePostTestComplete = (score: number) => {
    setPostTestScore(score);
    logInteraction({
      quest_id: 4,
      scene_id: 'post_test_complete',
      interaction_type: 'post_test',
      correct_flag: true,
      time_ms: 0,
      number: null,
      student_response: score.toString()
    });
    setStep('close');
  };

  return (
    <div className="min-h-screen bg-warm-neutral">
      <AnimatePresence mode='wait'>
        {step === 'welcome' && (
          <QuestWelcome
            key="welcome"
            questTitle="Quest 4: Freeze Addition"
            questIcon={<span className="text-6xl">❄️</span>}
            welcomeMessage="Great job Abaquester! You have learned so much already. Today we will learn to add using our Junior counter and practise the Freeze Rule!"
            audioKey="q4_welcome_msg"
            onNext={() => setStep('pretest-transition')}
          />
        )}

        {step === 'pretest-transition' && (
          <TransitionScreen
            key="pretest-transition"
            title="Let's Check What You Know"
            subtitle="Show us your addition skills before we start the adventure!"
            buttonText="Start Pre-Test"
            onNext={() => setStep('pretest')}
            variant="learning"
          />
        )}

        {step === 'pretest' && (
          <Quest4PreTest key="pretest" onComplete={handlePreTestComplete} isPreTest={true} />
        )}

        {step === 'explainer' && (
          <Quest4Explainer key="explainer" onNext={() => setStep('learn')} />
        )}

        {step === 'learn' && (
          <Quest4Learn key="learn" onComplete={() => setStep('practice')} />
        )}

        {step === 'practice' && (
          <Quest4Practice key="practice" onComplete={() => setStep('story-transition')} />
        )}

        {step === 'story-transition' && (
          <TransitionScreen
            key="story-transition"
            title="Story time!"
            subtitle="Journey with Ameer."
            buttonText="Story time!"
            // imageSrc="story-book.png" 
            onNext={() => setStep('story')}
            variant="story"
          />
        )}

        {step === 'story' && (
          <Quest4Story key="story" onComplete={() => setStep('posttest-transition')} />
        )}

        {step === 'posttest-transition' && (
          <PostTestCheckIn
            key="posttest-checkin"
            onComplete={() => setStep('posttest')}
          />
        )}

        {step === 'posttest' && (
          <Quest4PreTest key="posttest" onComplete={handlePostTestComplete} isPreTest={false} />
        )}

        {step === 'close' && (
          <QuestClose
            key="close"
            questTitle="Frozen Addition"
            questIcon="❄️"
            preTestScore={Math.round((preTestScore / 4) * 100)} // normalize to % if out of 4
            postTestScore={Math.round((postTestScore / 4) * 100)}
            coinsEarned={50} // simplified
            learningGain={Math.round(((postTestScore - preTestScore) / 4) * 100)}
            summary="You learned that adding zero changes nothing! The number stays frozen!"
            onNext={() => onComplete({
              pre: Math.round((preTestScore / 4) * 100),
              post: Math.round((postTestScore / 4) * 100)
            })}
            nextButtonText="Back to Adventure Map 🗺️"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
