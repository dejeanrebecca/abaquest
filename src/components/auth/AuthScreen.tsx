import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentSelect } from './StudentSelect';
import { TeacherSelect } from './TeacherSelect';
import { EmojiPassChallenge } from './EmojiPassChallenge';
import { TeacherRosterDashboard } from './TeacherRosterDashboard';
import { StudentProfile } from '../../types/quest';
import { Button } from '../ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { studentService } from '../../services/studentService';

interface AuthScreenProps {
    onAuthenticated: (student: StudentProfile) => void;
}


const INITIAL_PROFILES: StudentProfile[] = [
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


export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
    const [view, setView] = useState<'teacher-select' | 'student-select' | 'confirm' | 'challenge' | 'teacher-dashboard'>('teacher-select');
    const [selectedTeacher, setSelectedTeacher] = useState<StudentProfile | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [profiles, setProfiles] = useState<StudentProfile[]>(INITIAL_PROFILES);

    useEffect(() => {
        const updateProfilesState = (cloudProfiles: StudentProfile[]) => {
            const mergedInitial = INITIAL_PROFILES.map(ip => {
                const cloudVersion = cloudProfiles.find(sp => sp.id === ip.id);
                if (cloudVersion) {
                    return {
                        ...cloudVersion,
                        teacherId: ip.teacherId, 
                        role: ip.role || 'student'
                    };
                }
                return ip;
            });

            const customProfiles = cloudProfiles.filter(sp =>
                !INITIAL_PROFILES.some(dp => dp.id === sp.id)
            );

            // Deduplicate by ID just in case
            const allProfiles = [...mergedInitial, ...customProfiles];
            const uniqueProfiles = Array.from(new Map(allProfiles.map(p => [p.id, p])).values());
            
            setProfiles(uniqueProfiles);
            
            // Backup to localStorage
            localStorage.setItem('abaquest_students', JSON.stringify(uniqueProfiles));
        };

        const initProfiles = async () => {
            setIsLoading(true);
            try {
                const cloudProfiles = await studentService.fetchProfiles();
                updateProfilesState(cloudProfiles);
            } catch (error) {
                console.error("Failed to load profiles from cloud:", error);
            } finally {
                setIsLoading(false);
            }
        };

        initProfiles();

        // 2. Subscribe to real-time updates
        const unsubscribe = studentService.subscribeToProfiles((cloudProfiles) => {
            updateProfilesState(cloudProfiles);
        });

        return () => unsubscribe();
    }, []);


    const handleTeacherSelect = (teacher: StudentProfile) => {
        setSelectedTeacher(teacher);
        setView('student-select');
    };

    const handleStudentSelect = (student: StudentProfile) => {
        setSelectedStudent(student);
        setView('confirm');
    };

    const teachers = profiles.filter(p => p.role === 'teacher');
    const classStudents = profiles.filter(p => p.teacherId === selectedTeacher?.id);

    return (
        <div className="min-h-screen bg-warm-neutral flex flex-col items-center justify-center p-4">
            <header className="mb-8 text-center relative w-full max-w-4xl flex items-center justify-center">
                {view !== 'teacher-select' && view !== 'teacher-dashboard' && (
                    <Button
                        variant="ghost"
                        onClick={() => {
                            if (view === 'student-select') {
                                setView('teacher-select');
                                setSelectedTeacher(null);
                            } else if (view === 'confirm') {
                                setView('student-select');
                                setSelectedStudent(null);
                            } else if (view === 'challenge') {
                                setView('student-select');
                                setSelectedStudent(null);
                            }
                        }}
                        className="absolute left-0 text-deep-blue hover:bg-white/50 px-4 py-2"
                    >
                        <ArrowLeft className="w-6 h-6 mr-2" />
                        Back
                    </Button>
                )}
                <div>
                    <h1 className="text-4xl font-bold text-deep-blue mb-2">School of Mental Math</h1>
                    <p className="text-xl text-deep-blue/60">
                        {view === 'teacher-select' && "Who is your teacher?"}
                        {view === 'student-select' && `Welcome to ${selectedTeacher?.name}'s Class!`}
                        {(view === 'confirm' || view === 'challenge') && "Almost there!"}
                    </p>
                </div>
            </header>

            {isLoading && (
                <div className="fixed top-6 right-6 flex items-center gap-3 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-deep-blue/10 z-[60]">
                    <Loader2 className="w-5 h-5 text-deep-blue animate-spin" />
                    <span className="text-deep-blue text-sm font-bold animate-pulse">Syncing...</span>
                </div>
            )}

            <AnimatePresence mode="wait">
                {view === 'teacher-select' ? (
                    <motion.div
                        key="teacher-select"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-4xl"
                    >
                        <TeacherSelect teachers={teachers} onSelect={handleTeacherSelect} />
                    </motion.div>
                ) : view === 'student-select' ? (
                    <motion.div
                        key="student-select"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full max-w-5xl max-h-[70vh] overflow-y-auto px-4 pb-12 rounded-3xl"
                    >
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={() => {
                                    handleStudentSelect(selectedTeacher!); // Teachers logging in directly
                                }}
                                className="bg-white/80 hover:bg-white border-2 border-deep-blue/20 rounded-xl px-6 py-3 text-deep-blue font-semibold shadow-sm transition-all flex items-center gap-3"
                            >
                                <span className="text-2xl">{selectedTeacher?.avatar}</span>
                                I am {selectedTeacher?.name}
                            </button>
                        </div>
                        <StudentSelect students={classStudents} onSelect={handleStudentSelect} />
                    </motion.div>
                ) : view === 'confirm' ? (
                    <motion.div
                        key="confirm"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-lg bg-white border-4 border-deep-blue rounded-3xl p-8 shadow-2xl text-center"
                    >
                        {selectedStudent && (
                            <>
                                <div className="text-[120px] mb-6 leading-none animate-bounce">{selectedStudent.avatar}</div>
                                <h2 className="text-4xl font-bold text-deep-blue mb-10">Are you {selectedStudent.name}?</h2>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button
                                        onClick={() => {
                                            setSelectedStudent(null);
                                            setView('student-select');
                                        }}
                                        className="flex-1 px-8 py-5 rounded-2xl text-2xl font-bold border-4 border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors active:scale-95"
                                    >
                                        No
                                    </button>
                                    <button
                                        onClick={() => setView('challenge')}
                                        className="flex-1 px-8 py-5 rounded-2xl text-2xl font-bold bg-green-500 text-white shadow-lg border-4 border-green-600 hover:bg-green-600 transition-colors active:scale-95"
                                    >
                                        Yes!
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                ) : view === 'challenge' ? (
                    <motion.div
                        key="challenge"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="w-full relative min-h-[500px]"
                    >
                        {selectedStudent && (
                            <EmojiPassChallenge
                                student={selectedStudent}
                                onSuccess={async () => {
                                    const now = new Date().toISOString();
                                    const updatedStudent = { ...selectedStudent, lastLogin: now };


                                    if (updatedStudent.role === 'teacher') {
                                        setView('teacher-dashboard');
                                    } else {
                                        onAuthenticated(updatedStudent);
                                    }

                                    // Sync login timestamp to cloud in the background (non-blocking)
                                    studentService.saveProfile(updatedStudent).catch(error => {
                                        console.error("Failed to sync login update:", error);
                                    });
                                }}
                                onBack={() => {
                                    setSelectedStudent(null);
                                    setView('student-select');
                                }}
                            />
                        )}
                    </motion.div>
                ) : view === 'teacher-dashboard' ? (
                    <motion.div
                        key="teacher-dashboard"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full fixed inset-0 bg-warm-neutral z-50 overflow-y-auto"
                    >
                        {selectedStudent && (
                            <TeacherRosterDashboard
                                teacher={selectedStudent}
                                allProfiles={profiles}

                                onUpdateProfiles={async (newProfiles) => {
                                    // Identify what changed and sync it
                                    // This is a bit brute-force but ensures sync. 
                                    // Better approach is handled inside TeacherRosterDashboard itself
                                    setProfiles(newProfiles);
                                }}
                                onLogout={() => {
                                    setSelectedStudent(null);
                                    setView('teacher-select');
                                }}
                            />
                        )}
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
}
