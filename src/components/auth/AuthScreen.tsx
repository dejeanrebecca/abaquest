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
            // Check LocalStorage first
            const saved = localStorage.getItem('abaquest_students');
            if (saved) {
                setStudents(JSON.parse(saved));
            } else {
                // Create dummy students for demo
                // Hash for pattern "5" (Ameer) -> SHA-256
                const hash5 = await hashBeadPattern([5]);
                // Hash for pattern "3" (Ameerah) -> SHA-256
                const hash3 = await hashBeadPattern([3]);

                const dummyStudents: StudentProfile[] = [
                    {
                        id: 's1',
                        name: 'Ameer',
                        avatar: '👦',
                        beadPassHash: hash5,
                        gradeLevel: 'K',
                        progress: {
                            studentName: 'Ameer',
                            emotionalState: '',
                            totalCoins: 0,
                            level: 1,
                            xp: 0,
                            completedQuests: [],
                            currentQuestId: null,
                            questProgress: {} as any, // Placeholder
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
                            emotionalState: '',
                            totalCoins: 0,
                            level: 1,
                            xp: 0,
                            completedQuests: [],
                            currentQuestId: null,
                            questProgress: {} as any, // Placeholder
                        }
                    },
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
                                onSuccess={() => onAuthenticated(selectedStudent)}
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
