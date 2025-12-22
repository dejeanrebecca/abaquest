import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile } from '../../types/quest';
import { Button } from '../ui/button';
import { hashBeadPattern } from '../../utils/auth';
import { ArrowLeft, RefreshCw, Trophy, Star, Coins } from 'lucide-react';


interface TeacherDashboardProps {
    onBack: () => void;
}

export function TeacherDashboard({ onBack }: TeacherDashboardProps) {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [resettingStudent, setResettingStudent] = useState<StudentProfile | null>(null);

    useEffect(() => {
        const loadStudents = () => {
            const saved = localStorage.getItem('abaquest_students');
            if (saved) {
                // Filter out the teacher
                const allProfiles = JSON.parse(saved) as StudentProfile[];
                setStudents(allProfiles.filter(s => s.role !== 'teacher'));
            }
        };
        loadStudents();
    }, []);

    const handleResetPass = async (student: StudentProfile) => {
        // Reset to default pattern "1-2-3"
        const defaultHash = await hashBeadPattern([1, 2, 3]);

        const updatedStudents = students.map(s =>
            s.id === student.id ? { ...s, beadPassHash: defaultHash } : s
        );

        setStudents(updatedStudents);

        // Update local storage (need to include teacher back in)
        const saved = localStorage.getItem('abaquest_students');
        if (saved) {
            const allProfiles = JSON.parse(saved) as StudentProfile[];
            const teacher = allProfiles.find(s => s.role === 'teacher');
            const dataToSave = teacher ? [...updatedStudents, teacher] : updatedStudents;
            localStorage.setItem('abaquest_students', JSON.stringify(dataToSave));
        }

        setResettingStudent(null);
        alert(`Bead Pass for ${student.name} reset to: 1-2-3`);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
            <header className="bg-deep-blue text-white p-6 shadow-md">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
                            <ArrowLeft className="w-6 h-6 mr-2" />
                            Back
                        </Button>
                        <h1 className="text-3xl font-bold">Teacher Dashboard 👩‍🏫</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Star className="text-sunburst-yellow w-8 h-8 fill-current" />
                    Student Progress
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {students.map(student => (
                        <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="text-5xl">{student.avatar}</div>
                                <div>
                                    <h3 className="text-2xl font-bold text-deep-blue">{student.name}</h3>
                                    <p className="text-slate-500 font-medium">{student.gradeLevel === 'K' ? 'Kindergarten' : 'Grade 1-2'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="bg-blue-50 p-4 rounded-xl">
                                    <div className="text-blue-500 mb-1 font-bold text-sm uppercase tracking-wide">Level</div>
                                    <div className="text-3xl font-bold text-deep-blue flex items-center gap-2">
                                        {student.progress?.level || 1}
                                        <Trophy className="w-5 h-5 text-sunburst-yellow" />
                                    </div>
                                </div>
                                <div className="bg-amber-50 p-4 rounded-xl">
                                    <div className="text-amber-600 mb-1 font-bold text-sm uppercase tracking-wide">Coins</div>
                                    <div className="text-3xl font-bold text-deep-blue flex items-center gap-2">
                                        {student.progress?.totalCoins || 0}
                                        <Coins className="w-5 h-5 text-amber-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <div className="text-sm font-bold text-slate-400 mb-2 uppercase tracking-wide">Quests Completed</div>
                                <div className="flex flex-wrap gap-2">
                                    {student.progress?.completedQuests?.length > 0 ? (
                                        student.progress.completedQuests.map(qId => (
                                            <span key={qId} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold border border-green-200">
                                                Quest {qId}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-slate-400 italic">No quests yet</span>
                                    )}
                                </div>
                            </div>

                            <Button
                                onClick={() => setResettingStudent(student)}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reset Bead Pass
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </main>

            <AnimatePresence>
                {resettingStudent && (
                    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
                        >
                            <h3 className="text-2xl font-bold text-deep-blue mb-4">Reset Bead Pass?</h3>
                            <p className="text-slate-600 mb-6">
                                Are you sure you want to reset <strong>{resettingStudent.name}'s</strong> bead pass?
                                <br /><br />
                                The new pass will be: <strong>1 - 2 - 3</strong>
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800"
                                    onClick={() => setResettingStudent(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-abacus-red hover:bg-red-600 text-white"
                                    onClick={() => handleResetPass(resettingStudent)}
                                >
                                    Reset Pass
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
