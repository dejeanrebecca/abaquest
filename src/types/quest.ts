// Quest type definitions for AbaQuest

export type QuestId = 1 | 2 | 3 | 4;

export type QuestStep =
  | 'welcome'
  | 'pretest'
  | 'learn'
  | 'story'
  | 'posttest'
  | 'close';

export interface Quest {
  id: QuestId;
  title: string;
  description: string;
  icon: string;
  color: string;
  steps: QuestStep[];
  estimatedMinutes: number;
  coinReward: number;
}

export interface QuestProgress {
  questId: QuestId;
  currentStep: QuestStep;
  stepIndex: number;
  completed: boolean;
  preTestScore: number;
  postTestScore: number;
  coinsEarned: number;
  startedAt: string;
  completedAt?: string;

  // Tracking interaction metrics
  interactions?: {
    total: number;
    preTest: number;
    practice: number;
    postTest: number;
    story: number;
  };
  rawInteractions?: any[]; // Full interaction log for research export
}

export interface StudentProgress {
  studentId?: string; // Links progress to a specific StudentProfile
  studentName: string;
  emotionalState: string;
  totalCoins: number;
  level: number;
  xp: number;
  completedQuests: QuestId[];
  currentQuestId: QuestId | null;
  questProgress: Record<QuestId, QuestProgress>;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatar: string; // Emoji char
  emojiPass: string[]; // Array of 3 emojis
  gradeLevel: 'K' | '1-2';
  role?: 'student' | 'teacher' | 'admin'; // Default is 'student'
  teacherId?: string; // ID of the teacher this student belongs to
  lastLogin?: string; // ISO timestamp
  progress: StudentProgress;
}




// Quest definitions
export const QUESTS: Record<QuestId, Quest> = {
  1: {
    id: 1,
    title: 'Quest 1',
    description: 'Name your Junior Counter and meet your new classmates at the School of Mental Math!',
    icon: '✏️',
    color: 'from-sunburst-yellow to-orange-400',
    steps: ['welcome', 'pretest', 'learn', 'story', 'posttest', 'close'],
    estimatedMinutes: 8,
    coinReward: 20,
  },
  2: {
    id: 2,
    title: 'Quest 2',
    description: 'Learn the Upper Bead (Head), Lower Beads (Legs), and Answer Rod (Body)!',
    icon: '🧩',
    color: 'from-aqua-blue to-blue-500',
    steps: ['welcome', 'pretest', 'learn', 'story', 'posttest', 'close'],
    estimatedMinutes: 8,
    coinReward: 25,
  },
  3: {
    id: 3,
    title: 'Quest 3',
    description: 'Discover where each number lives on the Junior Counter!',
    icon: '🔢',
    color: 'from-deep-blue to-purple-600',
    steps: ['welcome', 'pretest', 'learn', 'story', 'posttest', 'close'],
    estimatedMinutes: 10,
    coinReward: 30,
  },
  4: {
    id: 4,
    title: 'Quest 4',
    description: 'Master the Freeze rule (+0) and learn to add numbers on your counter!',
    icon: '➕',
    color: 'from-abacus-red to-pink-500',
    steps: ['welcome', 'pretest', 'learn', 'story', 'posttest', 'close'],
    estimatedMinutes: 10,
    coinReward: 35,
  },
};

// Step metadata
export const STEP_METADATA: Record<QuestStep, { title: string; icon: string }> = {
  welcome: { title: 'Welcome', icon: '👋' },
  pretest: { title: 'Pre-Test', icon: '📋' },
  learn: { title: 'Learn', icon: '📚' },
  story: { title: 'Story Time', icon: '📖' },
  posttest: { title: 'Post-Test', icon: '✅' },
  close: { title: 'Quest Complete', icon: '🎉' },
};
