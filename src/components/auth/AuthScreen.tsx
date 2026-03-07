import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentSelect } from './StudentSelect';
import { TeacherSelect } from './TeacherSelect';
import { EmojiPassChallenge } from './EmojiPassChallenge';
import { TeacherRosterDashboard } from './TeacherRosterDashboard';
import { StudentProfile } from '../../types/quest';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { DbService, useDbSync } from '../../services/db.service';

interface AuthScreenProps {
    onAuthenticated: (student: StudentProfile) => void;
}

export function AuthScreen({ onAuthenticated }: AuthScreenProps) {
    const [view, setView] = useState<'teacher-select' | 'student-select' | 'confirm' | 'challenge' | 'teacher-dashboard'>('teacher-select');
    const [selectedTeacher, setSelectedTeacher] = useState<StudentProfile | null>(null);
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
    const [profiles, setProfiles] = useState<StudentProfile[]>([]);

    // Check for initialization
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initDb = async () => {
            await DbService.init();
            setIsInitialized(true);
            const loadedProfiles = await DbService.getProfiles();
            setProfiles(loadedProfiles);
        };
        initDb();
    }, []);

    // Sync across tabs and local DB updates
    useEffect(() => {
        if (!isInitialized) return;

        const fetchProfiles = async () => {
            const loadedProfiles = await DbService.getProfiles();
            setProfiles(loadedProfiles);
        };

        const unsubscribe = useDbSync(fetchProfiles);

        return () => {
            unsubscribe();
        }
    }, [isInitialized]);



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

                                    await DbService.updateProfile(updatedStudent);

                                    // Local state update happens automatically via subscription
                                    if (updatedStudent.role === 'teacher') {
                                        setView('teacher-dashboard');
                                    } else {
                                        onAuthenticated(updatedStudent);
                                    }
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
