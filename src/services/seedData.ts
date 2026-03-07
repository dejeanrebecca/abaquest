import { StudentProfile } from '../types/quest';

export const INITIAL_PROFILES: StudentProfile[] = [
    {
        id: 'teacher1',
        name: 'Ms. Teacher',
        avatar: '👩‍🏫',
        emojiPass: ['🍎', '🍎', '🍎'],
        gradeLevel: 'K',
        role: 'teacher',
        progress: {
            studentName: 'Ms. Teacher',
            emotionalState: '',
            totalCoins: 0,
            level: 99,
            xp: 0,
            completedQuests: [],
            currentQuestId: null,
            questProgress: {} as any,
        }
    },
    {
        id: 'teacher2',
        name: 'Mr. Smith',
        avatar: '👨‍🏫',
        emojiPass: ['🚗', '🚗', '🚗'],
        gradeLevel: 'K',
        role: 'teacher',
        progress: {
            studentName: 'Mr. Smith',
            emotionalState: '',
            totalCoins: 0,
            level: 99,
            xp: 0,
            completedQuests: [],
            currentQuestId: null,
            questProgress: {} as any,
        }
    },
    {
        id: 's1',
        name: 'Ameer',
        avatar: '👦',
        emojiPass: ['🐶', '🐶', '🐶'],
        gradeLevel: 'K',
        teacherId: 'teacher1',
        progress: {
            studentName: 'Ameer',
            emotionalState: 'happy',
            totalCoins: 0,
            level: 1,
            xp: 0,
            completedQuests: [],
            currentQuestId: 1,
            questProgress: {} as any,
        }
    },
    {
        id: 's2',
        name: 'Ameerah',
        avatar: '👧',
        emojiPass: ['⭐', '⭐', '⭐'],
        gradeLevel: 'K',
        teacherId: 'teacher1',
        progress: {
            studentName: 'Ameerah',
            emotionalState: 'excited',
            totalCoins: 0,
            level: 1,
            xp: 0,
            completedQuests: [],
            currentQuestId: 1,
            questProgress: {} as any,
        }
    },
    {
        id: 's3',
        name: 'Liam',
        avatar: '👱‍♂️',
        emojiPass: ['🚗', '🚗', '🚗'],
        gradeLevel: 'K',
        teacherId: 'teacher2',
        progress: {
            studentName: 'Liam',
            emotionalState: 'happy',
            totalCoins: 0,
            level: 1,
            xp: 0,
            completedQuests: [],
            currentQuestId: 1,
            questProgress: {} as any,
        }
    },
    {
        id: 's4',
        name: 'Noah',
        avatar: '👦🏽',
        emojiPass: ['🍎', '🍎', '🍎'],
        gradeLevel: 'K',
        teacherId: 'teacher2',
        progress: {
            studentName: 'Noah',
            emotionalState: 'happy',
            totalCoins: 0,
            level: 1,
            xp: 0,
            completedQuests: [],
            currentQuestId: 1,
            questProgress: {} as any,
        }
    }
];
