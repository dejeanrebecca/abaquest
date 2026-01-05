import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile, QuestId } from '../../types/quest';
import { Button } from '../ui/button';
import { hashBeadPattern } from '../../utils/auth';
import { ArrowLeft, RefreshCw, Trophy, Star, Coins, Calendar, X, BarChart2 } from 'lucide-react';

interface TeacherDashboardProps {
    onBack: () => void;
}

export function TeacherDashboard({ onBack }: TeacherDashboardProps) {
    const [students, setStudents] = useState<StudentProfile[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
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

    const calculateDuration = (start?: string, end?: string) => {
        if (!start || !end) return '-';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffMins = Math.round(diffMs / 60000);
        return `${diffMins} min`;
    };

    const handleExportCSV = (student: StudentProfile) => {
        // Headers
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Student Name,Quest ID,Status,Pre-Test Score,Post-Test Score,Learning Gain,Time Spent,Date Completed\n";

        // Rows
        [1, 2, 3, 4].forEach(qId => {
            const progress = student.progress?.questProgress?.[qId as QuestId];
            const statusInfo = getQuestStatus(student, qId.toString());

            const pre = progress?.preTestScore ?? 0;
            const post = progress?.postTestScore ?? 0;
            const gain = (progress?.postTestScore !== undefined && progress?.preTestScore !== undefined)
                ? post - pre
                : 0;

            const duration = calculateDuration(progress?.startedAt, progress?.completedAt);
            const date = progress?.completedAt ? new Date(progress.completedAt).toLocaleDateString() : '-';

            const row = [
                student.name,
                `Quest ${qId}`,
                statusInfo.status,
                pre,
                post,
                gain > 0 ? `+${gain}` : gain,
                duration,
                date
            ].join(",");
            csvContent += row + "\n";
        });

        // Download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${student.name}_progress_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
            <header className="bg-deep-blue text-white p-6 shadow-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={onBack} className="text-white hover:bg-white/10">
                            <ArrowLeft className="w-6 h-6 mr-2" />
                            Back to App
                        </Button>
                        <h1 className="text-3xl font-bold">Teacher Dashboard 👩‍🏫</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Star className="text-sunburst-yellow w-8 h-8 fill-current" />
                    Class Roster
                </h2>

                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedStudent(student)}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 cursor-pointer hover:shadow-xl transition-all"
                        >
                <div className="flex items-center gap-4 mb-4">
                    <div className="text-5xl">{student.avatar}</div>
                    <div>
                        <h3 className="text-2xl font-bold text-deep-blue">{student.name}</h3>
                        <p className="text-slate-500 font-medium text-sm flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Last Login: {formatDate(student.lastLogin).split(' ')[0]}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-slate-600 bg-slate-50 p-3 rounded-lg">
                    <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-sunburst-yellow" />
                        Lvl {student.progress?.level || 1}
                    </span>
                    <span className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-amber-500" />
                        {student.progress?.totalCoins || 0}
                    </span>
                </div>
                <div className="mt-4 flex gap-1">
                    {[1, 2, 3, 4].map(qId => {
                        const completed = student.progress?.questProgress?.[qId as QuestId]?.completed;
                        return (
                            <div
                                key={qId}
                                className={`h-2 flex-1 rounded-full ${completed ? 'bg-green-500' : 'bg-slate-100'}`}
                                title={`Quest ${qId}: ${completed ? 'Completed' : 'Incomplete'}`}
                            />
                        );
                    })}
                </div>
                <p className="text-right text-xs text-slate-400 mt-1">
                    {[1, 2, 3, 4].filter(q => student.progress?.questProgress?.[q as QuestId]?.completed).length}/4 Quests
                </p>
            </motion.div>
                    ))}
        </div>
            </main >

        {/* Detailed Student Modal */ }
        <AnimatePresence>
    {
        selectedStudent && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div
                    layoutId={selectedStudent.id}
                    className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Modal Header */}
                    <div className="bg-deep-blue text-white p-8 flex justify-between items-start">
                        <div className="flex gap-6 items-center">
                            <div className="text-7xl bg-white/10 p-4 rounded-3xl backdrop-blur-md">
                                {selectedStudent.avatar}
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold mb-2">{selectedStudent.name}</h2>
                                <div className="flex gap-6 text-white/80 text-lg">
                                    <p className="flex items-center gap-2">
                                        <Trophy className="w-6 h-6 text-sunburst-yellow" />
                                        Level {selectedStudent.progress?.level || 1}
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Coins className="w-6 h-6 text-amber-400" />
                                        {selectedStudent.progress?.totalCoins || 0} Coins
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <Calendar className="w-6 h-6" />
                                        Last: {formatDate(selectedStudent.lastLogin)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedStudent(null)}
                            className="text-white hover:bg-white/20 rounded-full p-2 h-auto"
                        >
                            <X className="w-8 h-8" />
                        </Button>
                    </div>

                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-deep-blue flex items-center gap-2">
                                <BarChart2 className="w-6 h-6" />
                                Performance Analytics
                            </h3>
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleExportCSV(selectedStudent)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-bold"
                                >
                                    Download Report (.csv)
                                </Button>

                                <Button
                                    onClick={() => setResettingStudent(selectedStudent)}
                                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reset Password
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">Quest</th>
                                        <th className="p-4">Status</th>
                                        <th className="p-4 text-center">Pre-Test</th>
                                        <th className="p-4 text-center">Highest Score</th>
                                        <th className="p-4 text-center">Learning Gain</th>
                                        <th className="p-4 text-center">Time Spent</th>
                                        <th className="p-4 text-right">Completed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[1, 2, 3, 4].map(qId => {
                                        const { status, color, icon } = getQuestStatus(selectedStudent, qId.toString());
                                        const progress = selectedStudent.progress?.questProgress?.[qId as QuestId];

                                        const pre = progress?.preTestScore;
                                        const post = progress?.postTestScore;
                                        const gain = (post !== undefined && pre !== undefined) ? post - pre : null;
                                        const duration = calculateDuration(progress?.startedAt, progress?.completedAt);

                                        return (
                                            <tr key={qId} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="p-4 font-bold text-deep-blue text-lg">Quest {qId}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex w-fit items-center gap-1 ${color}`}>
                                                        {icon} {status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center font-mono text-slate-600">
                                                    {pre !== undefined ? `${pre}%` : '-'}
                                                </td>
                                                <td className="p-4 text-center font-mono font-bold text-deep-blue text-lg">
                                                    {post !== undefined ? `${post}%` : '-'}
                                                </td>
                                                <td className="p-4 text-center">
                                                    {gain !== null ? (
                                                        <span className={`font-bold ${gain > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                                            {gain > 0 ? `+${gain}%` : `${gain}%`}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="p-4 text-center text-slate-600">
                                                    {duration}
                                                </td>
                                                <td className="p-4 text-right text-sm text-slate-500">
                                                    {progress?.completedAt ? new Date(progress.completedAt).toLocaleDateString() : '-'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }
            </AnimatePresence >

        {/* Reset Confirmation Modal (Reused) */ }
        <AnimatePresence>
    {
        resettingStudent && (
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
                            onClick={() => {
                                handleResetPass(resettingStudent);
                            }}
                        >
                            Reset Password
                        </Button>
                    </div>
                </motion.div>
            </div>
        )
    }
            </AnimatePresence >
        </div >
    );
}

// Helper Functions
function formatDate(dateString?: string): string {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getQuestStatus(student: StudentProfile, questId: string): { status: string; color: string; icon: string } {
    const qId = parseInt(questId) as QuestId;
    const progress = student.progress?.questProgress?.[qId];

    if (progress?.completed) {
        return { status: 'Completed', color: 'bg-green-100 text-green-700', icon: '✅' };
    }
    if (progress?.startedAt) {
        return { status: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: '⏳' };
    }
    return { status: 'Not Started', color: 'bg-slate-100 text-slate-500', icon: '🔒' };
}

