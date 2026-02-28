import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentSelect } from './StudentSelect';
import { BeadPassChallenge } from './BeadPassChallenge';
import { StudentProfile } from '../../types/quest';
import { hashBeadPattern } from '../../utils/auth';

interface AuthScreenProps {
    onAuthenticated: (student: StudentProfile) => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
    const [view, setView] = useState<'select' | 'challenge'>('select');
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
    const [students, setStudents] = useState<StudentProfile[]>([]);

    useEffect(() => {
        // Initialize with dummy data if empty (simulate fetching from DB/LocalStorage)
        const loadStudents = async () => {
            // Hash for pattern "5" (Ameer) -> SHA-256
            const hash5 = await hashBeadPattern([5]);
            // Hash for pattern "3" (Ameerah) -> SHA-256
            const hash3 = await hashBeadPattern([3]);
            // Hash for pattern "9" (Teacher) -> SHA-256
            const hash9 = await hashBeadPattern([9]);

            const teacherProfile: StudentProfile = {
                id: 'teacher1',
                name: 'Ms. Teacher',
                avatar: '👩‍🏫',
                beadPassHash: hash9,
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
            };

            // Check LocalStorage first
            const saved = localStorage.getItem('abaquest_students');
            if (saved) {
                let loadedStudents = JSON.parse(saved) as StudentProfile[];

                // Ensure teacher exists (migration fix for existing users)
                if (!loadedStudents.find(s => s.role === 'teacher')) {
                    loadedStudents = [...loadedStudents, teacherProfile];
                    localStorage.setItem('abaquest_students', JSON.stringify(loadedStudents));
                }

                setStudents(loadedStudents);
            } else {
                // Create dummy students for demo
                // Hash pattern generation
                const hash1 = await hashBeadPattern([1]);
                const hash2 = await hashBeadPattern([2]);
                const hash4 = await hashBeadPattern([4]);
                const hash6 = await hashBeadPattern([6]);
                const hash8 = await hashBeadPattern([8]);

                const dummyStudents: StudentProfile[] = [
                    {
                        id: 's1',
                        name: 'Ameer',
                        avatar: '👦',
                        beadPassHash: hash5,
                        gradeLevel: 'K',
                        progress: {
                            studentName: 'Ameer',
                            emotionalState: 'happy',
                            totalCoins: 20,
                            level: 2,
                            xp: 100,
                            completedQuests: [1],
                            currentQuestId: 2,
                            questProgress: {
                                1: { questId: 1, currentStep: 'close', stepIndex: 5, completed: true, preTestScore: 60, postTestScore: 100, coinsEarned: 20, startedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 86000000).toISOString() }
                            } as any,
                        }
                    },
                    {
                        id: 's2',
                        name: 'Ameerah',
                        avatar: '👧',
                        beadPassHash: hash3,
                        gradeLevel: 'K',
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
                        name: 'Sally',
                        avatar: '👱‍♀️',
                        beadPassHash: hash1,
                        gradeLevel: '1-2',
                        progress: {
                            studentName: 'Sally',
                            emotionalState: 'focused',
                            totalCoins: 150,
                            level: 4,
                            xp: 500,
                            completedQuests: [1, 2, 3],
                            currentQuestId: 4,
                            questProgress: {
                                1: { questId: 1, currentStep: 'close', stepIndex: 5, completed: true, preTestScore: 80, postTestScore: 100, coinsEarned: 20, startedAt: new Date(Date.now() - 172800000).toISOString(), completedAt: new Date(Date.now() - 172000000).toISOString() },
                                2: { questId: 2, currentStep: 'close', stepIndex: 5, completed: true, preTestScore: 50, postTestScore: 90, coinsEarned: 25, startedAt: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 85000000).toISOString() },
                                3: { questId: 3, currentStep: 'close', stepIndex: 5, completed: true, preTestScore: 40, postTestScore: 95, coinsEarned: 30, startedAt: new Date(Date.now() - 40000000).toISOString(), completedAt: new Date(Date.now() - 38000000).toISOString() }
                            } as any
                        }
                    },
                    {
                        id: 's4',
                        name: 'Jimmy',
                        avatar: '🧢',
                        beadPassHash: hash2,
                        gradeLevel: 'K',
                        progress: {
                            studentName: 'Jimmy',
                            emotionalState: 'confused',
                            totalCoins: 5,
                            level: 1,
                            xp: 20,
                            completedQuests: [],
                            currentQuestId: 1,
                            questProgress: {
                                1: { questId: 1, currentStep: 'learn', stepIndex: 2, completed: false, preTestScore: 20, postTestScore: 0, coinsEarned: 0, startedAt: new Date(Date.now() - 10000000).toISOString() }
                            } as any
                        }
                    },
                    {
                        id: 's5',
                        name: 'Pete',
                        avatar: '👓',
                        beadPassHash: hash4,
                        gradeLevel: '1-2',
                        lastLogin: new Date(Date.now() - 604800000).toISOString(), // 1 week ago
                        progress: {
                            studentName: 'Pete',
                            emotionalState: 'calm',
                            totalCoins: 80,
                            level: 3,
                            xp: 300,
                            completedQuests: [1, 2],
                            currentQuestId: 3,
                            questProgress: {
                                1: { questId: 1, currentStep: 'close', stepIndex: 5, completed: true, preTestScore: 90, postTestScore: 100, coinsEarned: 20, startedAt: new Date(Date.now() - 1209600000).toISOString(), completedAt: new Date(Date.now() - 1200000000).toISOString() },
                                2: { questId: 2, currentStep: 'close', stepIndex: 5, completed: true, preTestScore: 70, postTestScore: 85, coinsEarned: 25, startedAt: new Date(Date.now() - 604800000).toISOString(), completedAt: new Date(Date.now() - 600000000).toISOString() }
                            } as any
                        }
                    },
                    {
                        id: 's6',
                        name: 'Kim',
                        avatar: '🎨',
                        beadPassHash: hash6,
                        gradeLevel: 'K',
                        progress: {
                            studentName: 'Kim',
                            emotionalState: 'happy',
                            totalCoins: 45,
                            level: 2,
                            xp: 150,
                            completedQuests: [1],
                            currentQuestId: 2,
                            questProgress: {
                                1: { questId: 1, currentStep: 'close', stepIndex: 5, completed: true, preTestScore: 50, postTestScore: 90, coinsEarned: 20, startedAt: new Date(Date.now() - 200000000).toISOString(), completedAt: new Date(Date.now() - 198000000).toISOString() }
                            } as any
                        }
                    },
                    {
                        id: 's7',
                        name: 'Siddiq',
                        avatar: '⚽',
                        beadPassHash: hash8,
                        gradeLevel: '1-2',
                        progress: {
                            studentName: 'Siddiq',
                            emotionalState: 'excited',
                            totalCoins: 0,
                            level: 1,
                            xp: 0,
                            completedQuests: [],
                            currentQuestId: null,
                            questProgress: {} as any
                        }
                    },
                    teacherProfile
                ];

                setStudents(dummyStudents);
                localStorage.setItem('abaquest_students', JSON.stringify(dummyStudents));
            }
        };
        loadStudents();
    }, []);


    const handleStudentSelect = (student: StudentProfile) => {
        setSelectedStudent(student);
        setView('challenge');
    };

    return (
        <div className="min-h-screen bg-warm-neutral flex flex-col items-center justify-center p-4">
            <header className="mb-8 text-center">
                <h1 className="text-4xl font-bold text-deep-blue mb-2">School of Mental Math</h1>
                <p className="text-xl text-deep-blue/60">Who is playing today?</p>
            </header>

            <AnimatePresence mode="wait">
                {view === 'select' ? (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-4xl"
                    >
                        <StudentSelect students={students} onSelect={handleStudentSelect} />
                    </motion.div>
                ) : (
                    <motion.div
                        key="challenge"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full"
                    >
                        {selectedStudent && (
                            <BeadPassChallenge
                                student={selectedStudent}
                                onSuccess={() => {
                                    // Update last login time
                                    const now = new Date().toISOString();
                                    const updatedStudent = { ...selectedStudent, lastLogin: now };

                                    // Update local storage
                                    const updatedStudents = students.map(s =>
                                        s.id === selectedStudent.id ? updatedStudent : s
                                    );
                                    setStudents(updatedStudents);
                                    localStorage.setItem('abaquest_students', JSON.stringify(updatedStudents));

                                    onAuthenticated(updatedStudent);
                                }}
                                onBack={() => {
                                    setSelectedStudent(null);
                                    setView('select');
                                }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
