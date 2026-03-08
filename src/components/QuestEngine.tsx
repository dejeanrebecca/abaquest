import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { QuestId, QuestStep, QuestProgress, StudentProgress, QUESTS, StudentProfile } from '../types/quest';
import { DbService } from '../services/db.service';


interface QuestEngineContextType {
  studentProgress: StudentProgress;
  currentQuest: QuestId | null;
  currentStep: QuestStep | null;
  startQuest: (questId: QuestId) => void;
  completeStep: () => void;
  completeQuest: (preTestScore: number, postTestScore: number) => void;
  isQuestUnlocked: (questId: QuestId) => boolean;
  loadProfile: (profile: StudentProfile) => void;
  setStudentName: (name: string) => void;

  setEmotionalState: (state: string) => void;
  addCoins: (amount: number) => void;
  resetProgress: () => void;
  goToStep: (step: QuestStep) => void;
  exitQuest: () => void;
}

const QuestEngineContext = createContext<QuestEngineContextType | undefined>(undefined);

const INITIAL_PROGRESS: StudentProgress = {
  studentId: '',
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
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(INITIAL_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const init = async () => {
      await DbService.init();
      setIsLoading(false);
    };
    init();
  }, []);

  // Save to backend whenever progress changes
  useEffect(() => {
    if (isLoading) return;

    const syncToBackend = async () => {
      if (studentProgress.studentId) {
        try {
          const profiles = await DbService.getProfiles();
          const p = profiles.find(s => s.id === studentProgress.studentId);
          if (p) {
            await DbService.updateProfile({ ...p, progress: studentProgress });
          }
        } catch (e) {
          console.error('Error syncing progress to backend:', e);
        }
      }
    };
    syncToBackend();
  }, [studentProgress, isLoading]);

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
    // DEV MODE OVERRIDE: Unlock all quests for local testing
    if ((import.meta as any).env?.DEV) return true;

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
  };

  const exitQuest = () => {
    setStudentProgress(prev => ({
      ...prev,
      currentQuestId: null,
    }));
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
        loadProfile: (profile: StudentProfile) => setStudentProgress({
          ...profile.progress,
          studentId: profile.id
        }),
        setStudentName,
        setEmotionalState,

        addCoins,
        resetProgress,
        goToStep,
        exitQuest,
      }}
    >
      {isLoading ? null : children}
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
