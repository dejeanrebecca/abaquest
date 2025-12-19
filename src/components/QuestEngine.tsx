import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { QuestId, QuestStep, QuestProgress, StudentProgress, QUESTS } from '../types/quest';

interface QuestEngineContextType {
  studentProgress: StudentProgress;
  currentQuest: QuestId | null;
  currentStep: QuestStep | null;
  startQuest: (questId: QuestId) => void;
  completeStep: () => void;
  completeQuest: (preTestScore: number, postTestScore: number) => void;
  isQuestUnlocked: (questId: QuestId) => boolean;
  setStudentName: (name: string) => void;
  setEmotionalState: (state: string) => void;
  addCoins: (amount: number) => void;
  resetProgress: () => void;
  goToStep: (step: QuestStep) => void;
}

const QuestEngineContext = createContext<QuestEngineContextType | undefined>(undefined);

const INITIAL_PROGRESS: StudentProgress = {
  studentName: '',
  emotionalState: '',
  totalCoins: 0,
  level: 1,
  xp: 0,
  completedQuests: [],
  currentQuestId: null,
  questProgress: {} as Record<QuestId, QuestProgress>,
};

export function QuestEngineProvider({ children }: { children: ReactNode }) {
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('abaquest_progress');
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });

  // Save to localStorage whenever progress changes
  useEffect(() => {
    localStorage.setItem('abaquest_progress', JSON.stringify(studentProgress));
  }, [studentProgress]);

  const currentQuest = studentProgress.currentQuestId;
  const currentQuestProgress = currentQuest ? studentProgress.questProgress[currentQuest] : null;
  const currentStep = currentQuestProgress?.currentStep || null;

  const startQuest = (questId: QuestId) => {
    const quest = QUESTS[questId];
    const now = new Date().toISOString();

    setStudentProgress(prev => ({
      ...prev,
      currentQuestId: questId,
      questProgress: {
        ...prev.questProgress,
        [questId]: {
          questId,
          currentStep: quest.steps[0],
          stepIndex: 0,
          completed: false,
          preTestScore: 0,
          postTestScore: 0,
          coinsEarned: 0,
          startedAt: now,
        },
      },
    }));
  };

  const completeStep = () => {
    if (!currentQuest || !currentQuestProgress) return;

    const quest = QUESTS[currentQuest];
    const nextStepIndex = currentQuestProgress.stepIndex + 1;

    if (nextStepIndex >= quest.steps.length) {
      // Quest is complete, move to close step
      return;
    }

    setStudentProgress(prev => ({
      ...prev,
      questProgress: {
        ...prev.questProgress,
        [currentQuest]: {
          ...prev.questProgress[currentQuest],
          stepIndex: nextStepIndex,
          currentStep: quest.steps[nextStepIndex],
        },
      },
    }));
  };

  const goToStep = (step: QuestStep) => {
    if (!currentQuest) return;

    const quest = QUESTS[currentQuest];
    const stepIndex = quest.steps.indexOf(step);

    if (stepIndex === -1) return;

    setStudentProgress(prev => ({
      ...prev,
      questProgress: {
        ...prev.questProgress,
        [currentQuest]: {
          ...prev.questProgress[currentQuest],
          stepIndex,
          currentStep: step,
        },
      },
    }));
  };

  const completeQuest = (preTestScore: number, postTestScore: number) => {
    if (!currentQuest) return;

    const quest = QUESTS[currentQuest];
    const now = new Date().toISOString();

    setStudentProgress(prev => {
      const isAlreadyCompleted = prev.completedQuests.includes(currentQuest);
      const newCoins = isAlreadyCompleted ? 0 : quest.coinReward;

      return {
        ...prev,
        completedQuests: isAlreadyCompleted
          ? prev.completedQuests
          : [...prev.completedQuests, currentQuest],
        totalCoins: prev.totalCoins + newCoins,
        xp: prev.xp + (quest.coinReward * 5),
        level: Math.floor((prev.xp + quest.coinReward * 5) / 500) + 1,
        questProgress: {
          ...prev.questProgress,
          [currentQuest]: {
            ...prev.questProgress[currentQuest],
            completed: true,
            completedAt: now,
            preTestScore,
            postTestScore,
            coinsEarned: newCoins,
          },
        },
        currentQuestId: null,
      };
    });
  };

  const isQuestUnlocked = (questId: QuestId): boolean => {
    // Quest 1 is always unlocked
    if (questId === 1) return true;

    // Other quests unlock in sequence
    const previousQuestId = (questId - 1) as QuestId;
    return studentProgress.completedQuests.includes(previousQuestId);
  };

  const setStudentName = (name: string) => {
    setStudentProgress(prev => ({ ...prev, studentName: name }));
  };

  const setEmotionalState = (state: string) => {
    setStudentProgress(prev => ({ ...prev, emotionalState: state }));
  };

  const addCoins = (amount: number) => {
    setStudentProgress(prev => ({
      ...prev,
      totalCoins: prev.totalCoins + amount,
      xp: prev.xp + (amount * 5),
      level: Math.floor((prev.xp + amount * 5) / 500) + 1,
    }));
  };

  const resetProgress = () => {
    setStudentProgress(INITIAL_PROGRESS);
    localStorage.removeItem('abaquest_progress');
  };

  return (
    <QuestEngineContext.Provider
      value={{
        studentProgress,
        currentQuest,
        currentStep,
        startQuest,
        completeStep,
        completeQuest,
        isQuestUnlocked,
        setStudentName,
        setEmotionalState,
        addCoins,
        resetProgress,
        goToStep,
      }}
    >
      {children}
    </QuestEngineContext.Provider>
  );
}

export function useQuestEngine() {
  const context = useContext(QuestEngineContext);
  if (!context) {
    throw new Error('useQuestEngine must be used within QuestEngineProvider');
  }
  return context;
}
