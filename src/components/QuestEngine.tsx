import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { QuestId, QuestStep, QuestProgress, StudentProgress, QUESTS, StudentProfile } from '../types/quest';
import { studentService } from '../services/studentService';


interface QuestEngineContextType {
  studentProgress: StudentProgress;
  currentQuest: QuestId | null;
  currentStep: QuestStep | null;
  startQuest: (questId: QuestId) => void;
  completeStep: () => void;
  completeQuest: (
    preTestScore: number,
    postTestScore: number,
    interactions?: {
      total: number;
      preTest: number;
      practice: number;
      postTest: number;
      story: number;
    }
  ) => void;
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
  const [isLoading, setIsLoading] = useState(false);

  // Save to localStorage AND Firestore whenever progress changes
  const lastSyncRef = useRef<string>('');

  useEffect(() => {
    const progressJson = JSON.stringify(studentProgress);
    localStorage.setItem('abaquest_progress', progressJson);

    // Sync to Firestore if changed and we have an ID
    if (studentProgress.studentId && progressJson !== lastSyncRef.current) {
      const timeoutId = setTimeout(async () => {
        try {
          const profiles = await studentService.fetchProfiles();
          const currentProfile = profiles.find(p => p.id === studentProgress.studentId);

          if (currentProfile) {
            await studentService.saveProfile({
              ...currentProfile,
              progress: studentProgress
            });
            lastSyncRef.current = progressJson;
            console.log("Synced progress to cloud");
          }
        } catch (error) {
          console.error("Failed to sync progress to cloud:", error);
        }
      }, 3000); // 3s debounce for progress syncing

      return () => clearTimeout(timeoutId);
    }
  }, [studentProgress]);

  const currentQuest = studentProgress.currentQuestId;
  const currentQuestProgress = currentQuest ? studentProgress.questProgress[currentQuest] : null;
  const currentStep = currentQuestProgress?.currentStep || null;

  const startQuest = (questId: QuestId) => {
    const quest = QUESTS[questId];
    const now = new Date().toISOString();

    setStudentProgress(prev => {
      const existingProgress = prev.questProgress[questId];

      // If there's existing incomplete progress, resume from where they left off
      if (existingProgress && !existingProgress.completed) {
        return {
          ...prev,
          currentQuestId: questId,
        };
      }

      // Otherwise start fresh (new quest or replaying a completed quest)
      return {
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
      };
    });
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

  const completeQuest = (
    preTestScore: number,
    postTestScore: number,
    interactionData?: {
      total: number;
      preTest: number;
      practice: number;
      postTest: number;
      story: number;
    }
  ) => {
    if (!currentQuest) return;

    const quest = QUESTS[currentQuest];
    const now = new Date().toISOString();

    setStudentProgress(prev => {
      const isAlreadyCompleted = prev.completedQuests.includes(currentQuest);
      const newCoins = isAlreadyCompleted ? 0 : quest.coinReward;
      const existingProgress = prev.questProgress[currentQuest];

      // Keep the best scores across attempts
      const bestPreScore = isAlreadyCompleted && existingProgress
        ? Math.max(existingProgress.preTestScore, preTestScore)
        : preTestScore;
      const bestPostScore = isAlreadyCompleted && existingProgress
        ? Math.max(existingProgress.postTestScore, postTestScore)
        : postTestScore;

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
            preTestScore: bestPreScore,
            postTestScore: bestPostScore,
            coinsEarned: newCoins,
            ...(interactionData ? { interactions: interactionData } : {}),
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
          studentId: profile.id,
          currentQuestId: null, // Always land on Library first; student resumes from there
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
