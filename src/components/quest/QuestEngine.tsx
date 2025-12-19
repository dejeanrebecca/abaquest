import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestId, QuestStep, QUEST_STEPS, QUEST_METADATA } from '../../types/quest';
import { useDataLogger } from '../DataLogger';

// Import Quest Step Components (we'll create these)
import { QuestWelcome } from './steps/QuestWelcome';
import { QuestPreTest } from './steps/QuestPreTest';
import { QuestLesson } from './steps/QuestLesson';
import { QuestStory } from './steps/QuestStory';
import { QuestPostTest } from './steps/QuestPostTest';
import { QuestClose } from './steps/QuestClose';

interface QuestEngineProps {
  questId: QuestId;
  onQuestComplete: (questId: QuestId, coinsEarned: number) => void;
  onExit?: () => void;
}

export function QuestEngine({ questId, onQuestComplete, onExit }: QuestEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [pretestScore, setPretestScore] = useState(0);
  const [posttestScore, setPosttestScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const { logInteraction } = useDataLogger();

  const currentStep = QUEST_STEPS[currentStepIndex];
  const metadata = QUEST_METADATA[questId];

  const handleStepComplete = (stepData?: any) => {
    // Log step completion
    logInteraction({
      quest_id: questId,
      scene_id: `${currentStep}_complete`,
      number: null,
      correct_flag: true,
      time_ms: 0,
      interaction_type: 'practice',
    });

    // Store step-specific data
    if (currentStep === 'pretest' && stepData?.score !== undefined) {
      setPretestScore(stepData.score);
    }
    if (currentStep === 'posttest' && stepData?.score !== undefined) {
      setPosttestScore(stepData.score);
    }
    if (currentStep === 'close' && stepData?.coins !== undefined) {
      setCoinsEarned(stepData.coins);
    }

    // Move to next step or complete quest
    if (currentStepIndex < QUEST_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Quest complete
      onQuestComplete(questId, coinsEarned);
    }
  };

  const renderStep = () => {
    const stepProps = {
      questId,
      onComplete: handleStepComplete,
      onExit,
    };

    switch (currentStep) {
      case 'welcome':
        return <QuestWelcome {...stepProps} />;
      case 'pretest':
        return <QuestPreTest {...stepProps} />;
      case 'lesson':
        return <QuestLesson {...stepProps} />;
      case 'story':
        return <QuestStory {...stepProps} />;
      case 'posttest':
        return <QuestPostTest {...stepProps} pretestScore={pretestScore} />;
      case 'close':
        return (
          <QuestClose
            {...stepProps}
            pretestScore={pretestScore}
            posttestScore={posttestScore}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-warm-neutral relative">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-deep-blue shadow-lg">
        <div className="max-w-[1024px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-2">
            <div className="text-2xl">{metadata.icon}</div>
            <div className="flex-1">
              <p className="text-white text-sm">Quest {questId}: {metadata.title}</p>
              <p className="text-white/70 text-xs">{metadata.subtitle}</p>
            </div>
            <div className="text-white text-sm">
              Step {currentStepIndex + 1} of {QUEST_STEPS.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-deep-blue/50 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-sunburst-yellow"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / QUEST_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
