import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { StudentProfile } from '../../types/quest';
import { LogOut, Plus, Trash2, X, AlertCircle, Loader2, BarChart2, Trophy, Coins, Download, TrendingUp, Edit2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { QuestId } from '../../types/quest';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { normalizeScore } from '../../utils/quest';

interface TeacherDashboardProps {
    teacher: StudentProfile;
    allProfiles: StudentProfile[];
    onUpdateProfiles: (profiles: StudentProfile[]) => void;
    onLogout: () => void;
    onBackToAdmin?: () => void; // Optional callback for hybrid users
    dbError?: string | null;
}

const AVATARS = ['👦', '👧', '👦🏽', '👧🏽', '👱‍♂️', '👱‍♀️', '🧑‍🦱', '👩‍🦱', '👨‍🏫', '👩‍🏫', '🧑‍🏫', '🦸‍♂️', '🦸‍♀️'];
const EMOJI_GRID = ['🐶', '🐱', '🍎', '🚗', '⭐', '☀️', '🌙', '🌳', '🌸', '🔑', '🎈'];

export function TeacherRosterDashboard({ teacher, allProfiles, onUpdateProfiles, onLogout, onBackToAdmin, dbError }: TeacherDashboardProps) {
    const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
    const [newStudentName, setNewStudentName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [newPassword, setNewPassword] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [viewingStudent, setViewingStudent] = useState<StudentProfile | null>(null);
    const [selectedQuest, setSelectedQuest] = useState<QuestId>(1);
    const [isEditingTeacherAvatar, setIsEditingTeacherAvatar] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const currentTeacher = allProfiles.find(p => p.id === teacher.id) || teacher;

    // Dynamically calculate class roster (students assigned to THIS teacher)
    const classStudents = useMemo(() => {
        return allProfiles.filter(p => p.teacherId === teacher.id);
    }, [allProfiles, teacher.id]);

    // Calculate aggregated interactions for the selected quest
    const aggregatedInteractions = useMemo(() => {
        return classStudents.reduce(
            (acc, student) => {
                const questData = student.progress?.questProgress?.[selectedQuest];
                if (questData?.interactions) {
                    acc.total += questData.interactions.total || 0;
                    acc.preTest += questData.interactions.preTest || 0;
                    acc.practice += questData.interactions.practice || 0;
                    acc.postTest += questData.interactions.postTest || 0;
                    acc.story += questData.interactions.story || 0;
                }
                return acc;
            },
            { total: 0, preTest: 0, practice: 0, postTest: 0, story: 0 }
        );
    }, [classStudents, selectedQuest]);

    const handleUpdateTeacherAvatar = async (newAvatar: string) => {
        const updatedTeacher = { ...currentTeacher, avatar: newAvatar };
        setIsEditingTeacherAvatar(false);
        try {
            await studentService.saveProfile(updatedTeacher);
            // onUpdateProfiles is handled via onSnapshot now
        } catch (error) {
            console.error('Failed to update teacher avatar:', error);
        }
    };

    const handleAddEmoji = (emoji: string) => {
        if (newPassword.length < 3) {
            setNewPassword([...newPassword, emoji]);
        }
    };

    const handleRemoveEmoji = () => {
        if (newPassword.length > 0) {
            setNewPassword(newPassword.slice(0, -1));
        }
    };

    const openModalForAdd = () => {
        setEditingStudentId(null);
        setNewStudentName('');
        setSelectedAvatar(AVATARS[0]);
        setNewPassword([]);
        setError('');
        setIsEditingModalOpen(true);
    };

    const openModalForEdit = (student: StudentProfile) => {
        setEditingStudentId(student.id);
        setNewStudentName(student.name);
        setSelectedAvatar(student.avatar || AVATARS[0]);
        setNewPassword(student.emojiPass || []);
        setError('');
        setIsEditingModalOpen(true);
    };

    const handleSaveStudent = async () => {
        if (!newStudentName.trim()) {
            setError('Please enter a student name.');
            return;
        }
        if (newPassword.length !== 3) {
            setError('Please select exactly 3 emojis for the password.');
            return;
        }

        setError('');
        let updatedProfiles = [...allProfiles];
        let studentToSave: StudentProfile | null = null;

        if (editingStudentId) {
            // Edit existing student
            const existingIndex = allProfiles.findIndex(p => p.id === editingStudentId);
            if (existingIndex !== -1) {
                studentToSave = {
                    ...allProfiles[existingIndex],
                    name: newStudentName.trim(),
                    avatar: selectedAvatar,
                    emojiPass: [...newPassword],
                    progress: {
                        ...allProfiles[existingIndex].progress,
                        studentName: newStudentName.trim(),
                    }
                };
                updatedProfiles[existingIndex] = studentToSave;
            }
        } else {
            // Add new student
            studentToSave = {
                id: `student_${Date.now()}`,
                name: newStudentName.trim(),
                avatar: selectedAvatar,
                emojiPass: [...newPassword],
                gradeLevel: 'K',
                role: 'student',
                teacherId: teacher.id,
                progress: {
                    studentName: newStudentName.trim(),
                    emotionalState: 'happy',
                    totalCoins: 0,
                    level: 1,
                    xp: 0,
                    completedQuests: [],
                    currentQuestId: 1,
                    questProgress: {} as any,
                }
            };
            updatedProfiles = [...allProfiles, studentToSave];
        }

        if (!studentToSave) return;

        // OPTIMISTIC UPDATE: Update local state and close modal instantly
        onUpdateProfiles(updatedProfiles);
        setIsEditingModalOpen(false);
        setNewStudentName('');
        setSelectedAvatar(AVATARS[0]);
        setNewPassword([]);

        // BACKGROUND SYNC: Save to Firestore without awaiting to keep UI snappy
        studentService.saveProfile(studentToSave).catch(err => {
            console.error('Background save failed:', err);
            setError('Cloud sync failed, but local changes are saved.');
            // Note: We could roll back here, but for research/testing, keeping 
            // the local state is often preferred unless it's a critical failure.
        });
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (window.confirm('Are you sure you want to delete this student? All their progress will be lost.')) {
            try {
                await studentService.deleteProfile(studentId);
                const updatedProfiles = allProfiles.filter(p => p.id !== studentId);
                onUpdateProfiles(updatedProfiles);
            } catch (error) {
                alert('Failed to delete student from cloud.');
            }
        }
    };

    const handleResetAllData = async () => {
        if (window.confirm('⚠️ CRITICAL ACTION: Are you sure you want to RESET ALL progress for ALL students? This will clear all coins, scores, and levels. This cannot be undone.')) {
            setIsResetting(true);
            try {
                await studentService.resetProfiles(classStudents);
                // Profiles will auto-update through the subscription in AuthScreen
            } catch (error) {
                alert('Failed to reset student data. Please try again.');
            } finally {
                setIsResetting(false);
            }
        }
    };

    const calculateDuration = (start?: string, end?: string) => {
        if (!start || !end) return '-';
        const diffMs = new Date(end).getTime() - new Date(start).getTime();
        const diffMins = Math.round(diffMs / 60000);
        return `${diffMins} min`;
    };

    const handleExportJSON = (student: StudentProfile, qId?: QuestId) => {
        // If qId is provided, export just that quest. Otherwise export all with progress.
        const questsToExport = qId ? [qId] : ([1, 2, 3, 4] as QuestId[]).filter(id => !!student.progress?.questProgress?.[id]);

        const exportData = questsToExport.map(id => {
            const progress = student.progress?.questProgress?.[id];
            const pre = normalizeScore(progress?.preTestScore, id);
            const post = normalizeScore(progress?.postTestScore, id);
            const gain = post - pre;

            let highestNumber = 0;
            if (progress?.rawInteractions) {
                const builtNumbers = progress.rawInteractions
                    .filter(i => i.number !== null && i.correct_flag === true)
                    .map(i => i.number as number);
                if (builtNumbers.length > 0) highestNumber = Math.max(...builtNumbers);
            }

            return {
                student_name: student.name,
                quest_id: id,
                summary: {
                    pre_test_score: pre,
                    post_test_score: post,
                    learning_gain: gain,
                    highest_number_built: highestNumber,
                    total_coins: progress?.coinsEarned ?? 0,
                    total_interactions: progress?.interactions?.total ?? 0
                },
                interactions: progress?.rawInteractions ?? [],
                export_date: new Date().toISOString()
            };
        });

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const fileName = qId ? `${student.name}_quest${qId}_data.json` : `${student.name}_all_quests_data.json`;

        const link = document.createElement("a");
        link.setAttribute("href", dataUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportClassJSON = () => {
        const classData = classStudents.flatMap(student => {
            const studentQuests = ([1, 2, 3, 4] as QuestId[]).filter(id => !!student.progress?.questProgress?.[id]);

            return studentQuests.map(id => {
                const progress = student.progress?.questProgress?.[id];
                const pre = normalizeScore(progress?.preTestScore, id);
                const post = normalizeScore(progress?.postTestScore, id);
                const gain = post - pre;

                let highestNumber = 0;
                if (progress?.rawInteractions) {
                    const builtNumbers = progress.rawInteractions
                        .filter(i => i.number !== null && i.correct_flag === true)
                        .map(i => i.number as number);
                    if (builtNumbers.length > 0) highestNumber = Math.max(...builtNumbers);
                }

                return {
                    student_name: student.name,
                    quest_id: id,
                    summary: {
                        pre_test_score: pre,
                        post_test_score: post,
                        learning_gain: gain,
                        highest_number_built: highestNumber,
                        total_coins: progress?.coinsEarned ?? 0,
                        total_interactions: progress?.interactions?.total ?? 0
                    },
                    interactions: progress?.rawInteractions ?? [],
                    export_date: new Date().toISOString()
                };
            });
        });

        const dataStr = JSON.stringify(classData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const fileName = `class_full_report_${Date.now()}.json`;

        const link = document.createElement("a");
        link.setAttribute("href", dataUri);
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Dynamically calculate aggregated metrics for all quests
    const classMetricsData = useMemo(() => {
        return ([1, 2, 3, 4] as QuestId[]).map(qId => {
            let totalPre = 0;
            let totalPost = 0;
            let countPre = 0;
            let countPost = 0;
            let completedCount = 0;
            let maxPost = 0;
            let totalCoins = 0;

            classStudents.forEach(student => {
                const progress = student.progress?.questProgress?.[qId];
                if (progress?.preTestScore !== undefined) {
                    totalPre += normalizeScore(progress.preTestScore, qId);
                    countPre++;
                }
                if (progress?.postTestScore !== undefined) {
                    const normalizedPost = normalizeScore(progress.postTestScore, qId);
                    totalPost += normalizedPost;
                    countPost++;
                    if (normalizedPost > maxPost) maxPost = normalizedPost;
                }
                if (progress?.completed) {
                    completedCount++;
                }
                totalCoins += (progress?.coinsEarned || 0);
            });

            return {
                id: qId,
                name: `Quest ${qId}`,
                icon: ['✏️', '🧩', '🔢', '➕'][qId - 1],
                preTest: countPre > 0 ? Math.round(totalPre / countPre) : 0,
                postTest: countPost > 0 ? Math.round(totalPost / countPost) : 0,
                completedCount,
                totalCount: classStudents.length,
                maxPost,
                totalCoins
            };
        });
    }, [classStudents]);

    return (
        <div className="min-h-screen bg-warm-neutral pb-12">
            {/* Database Status Warning */}
            {dbError && (
                <div className="bg-red-50 border-b border-red-200 p-4 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto flex items-center gap-3 text-red-700 font-sans">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold">Database Connection Issue</p>
                            <p className="text-sm opacity-90">
                                {dbError.includes('permission-denied')
                                    ? "Firestore may not be initialized. Please ask the project owner (becca@thebeeprint.com) to initialize Firestore in Native Mode (select US East 1 for best performance)."
                                    : dbError}
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
                <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border-2 border-deep-blue/10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button
                                onClick={() => setIsEditingTeacherAvatar(!isEditingTeacherAvatar)}
                                className="text-5xl hover:scale-110 transition-transform cursor-pointer relative group flex items-center justify-center bg-slate-50 w-20 h-20 rounded-2xl border-2 border-slate-100"
                            >
                                {currentTeacher.avatar || '👨‍🏫'}
                                <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-slate-200">
                                    <Edit2 className="w-4 h-4 text-slate-500" />
                                </div>
                            </button>

                            {/* Avatar Picker Dropdown */}
                            <AnimatePresence>
                                {isEditingTeacherAvatar && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full mt-4 left-0 bg-white rounded-2xl p-4 shadow-xl border-2 border-slate-100 z-50 w-[280px]"
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-bold text-deep-blue text-sm">Select Your Avatar</h3>
                                            <button onClick={() => setIsEditingTeacherAvatar(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full p-1">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {AVATARS.map(avatar => (
                                                <button
                                                    key={avatar}
                                                    onClick={() => handleUpdateTeacherAvatar(avatar)}
                                                    className={`text-2xl p-2 rounded-xl hover:bg-slate-100 transition-all ${currentTeacher.avatar === avatar ? 'bg-blue-50 border-2 border-blue-200 scale-105 shadow-sm' : 'border-2 border-transparent hover:scale-105'}`}
                                                >
                                                    {avatar}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold text-deep-blue">Welcome, {currentTeacher.name}!</h1>
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1 shadow-sm">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    Live Class: {classStudents.length} Students
                                </span>
                            </div>
                            <p className="text-deep-blue/60 mt-1">Manage your classroom analytics and student roster</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {onBackToAdmin && (
                            <Button
                                variant="default"
                                onClick={onBackToAdmin}
                                className="bg-brand-blue hover:bg-brand-blue text-white rounded-2xl shadow-md border-none px-6"
                            >
                                <ShieldCheck className="w-5 h-5 mr-2" />
                                Admin View
                            </Button>
                        )}
                        <Button variant="outline" onClick={onLogout} className="text-deep-blue border-deep-blue hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-2xl">
                            <LogOut className="w-5 h-5 mr-2" />
                            Logout
                        </Button>
                    </div>
                </header>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-deep-blue/5">
                    <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h2 className="text-2xl font-bold text-deep-blue">Your Roster ({classStudents.length})</h2>
                        <Button onClick={openModalForAdd} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 py-2 rounded-xl border-none">
                            <Plus className="w-5 h-5 mr-2" />
                            Add Student
                        </Button>
                    </div>

                    <div className="p-6">
                        {classStudents.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <p className="text-xl mb-4">Your class is empty.</p>
                                <p>Click "Add Student" to start building your roster!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classStudents.map(student => (
                                    <motion.div
                                        key={student.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200 flex flex-col justify-between cursor-pointer hover:border-blue-300 hover:shadow-md transition-all"
                                        onClick={() => setViewingStudent(student)}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="text-4xl bg-white p-2 rounded-xl shadow-sm border border-slate-100">{student.avatar}</div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-deep-blue">{student.name}</h3>
                                                    <p className="text-sm text-slate-500">Level {student.progress.level}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); openModalForEdit(student); }}
                                                    className="text-slate-400 hover:text-blue-500 transition-colors p-2 bg-white rounded-full hover:bg-blue-50"
                                                    title="Edit Student"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id); }}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-white rounded-full hover:bg-red-50"
                                                    title="Delete Student"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password:</span>
                                            <div className="flex gap-1 text-2xl">
                                                {student.emojiPass?.map((emoji, idx) => (
                                                    <span key={idx}>{emoji}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Quest progress bar */}
                                        <div className="mt-3 flex gap-1">
                                            {[1, 2, 3, 4].map(qId => {
                                                const completed = student.progress?.questProgress?.[qId as QuestId]?.completed;
                                                return (
                                                    <div
                                                        key={qId}
                                                        className={`h-2 flex-1 rounded-full ${completed ? 'bg-green-500' : 'bg-slate-200'}`}
                                                        title={`Quest ${qId}: ${completed ? 'Completed' : 'Incomplete'}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <p className="text-right text-xs text-slate-400 mt-1">
                                            {[1, 2, 3, 4].filter(q => student.progress?.questProgress?.[q as QuestId]?.completed).length}/4 Quests • <span className="text-blue-500">Click for details</span>
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Class-Wide Analytics */}
                {classStudents.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-deep-blue/5 mt-8">
                        <div className="p-6 border-b-2 border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-deep-blue flex items-center gap-2">
                                <BarChart2 className="w-6 h-6" />
                                Class Analytics
                            </h2>
                            <button
                                onClick={handleExportClassJSON}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Learning Data (JSON)
                            </button>
                        </div>

                        <div className="p-6 border-b-2 border-slate-100">
                            <h3 className="text-xl font-bold text-deep-blue mb-4 text-center">Pre/Post Test Class Averages</h3>
                            <div className="h-80 w-full mb-6">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={classMetricsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
                                        <Tooltip formatter={(val: number) => [`${val}%`, undefined]} />
                                        <Legend />
                                        <Bar dataKey="preTest" name="Pre-Test" fill="#64748b" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="postTest" name="Post-Test" fill="#3BB5C5" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="p-6 border-b-2 border-slate-100 bg-white">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-deep-blue">Class-Wide Overview (All Quests)</h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetAllData}
                                    disabled={isResetting || classStudents.length === 0}
                                    className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all font-bold gap-2"
                                >
                                    {isResetting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    Reset Class Progress
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-y-2 border-slate-100">
                                            <th className="p-4">Quest</th>
                                            <th className="p-4 text-center">Completed</th>
                                            <th className="p-4 text-center">Avg Pre-Test</th>
                                            <th className="p-4 text-center">Avg Post-Test</th>
                                            <th className="p-4 text-center">Avg Gain</th>
                                            <th className="p-4 text-center">Highest Score</th>
                                            <th className="p-4 text-center">Total Coins</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {classMetricsData.map((data) => {
                                            const gain = data.postTest - data.preTest;
                                            const isSelected = selectedQuest === data.id;
                                            return (
                                                <tr
                                                    key={data.id}
                                                    onClick={() => setSelectedQuest(data.id)}
                                                    className={`cursor-pointer transition-all ${isSelected ? 'bg-blue-50/50 border-l-4 border-l-blue-500 shadow-sm' : 'hover:bg-slate-50/80 border-l-4 border-l-transparent'}`}
                                                >
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-2xl">{data.icon}</span>
                                                            <span className="font-bold text-deep-blue">{data.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center font-bold text-slate-600">
                                                        {data.completedCount}/{data.totalCount}
                                                    </td>
                                                    <td className="p-4 text-center text-blue-600 font-semibold">
                                                        {data.preTest}%
                                                    </td>
                                                    <td className="p-4 text-center text-green-600 font-semibold">
                                                        {data.postTest}%
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-1 rounded-lg font-bold text-sm ${gain > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                            {gain > 0 ? '+' : ''}{gain}%
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-1 text-amber-600 font-bold">
                                                            <Trophy className="w-4 h-4" />
                                                            {data.maxPost}%
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className="flex items-center justify-center gap-1 text-yellow-500 font-bold">
                                                            <Coins className="w-4 h-4 fill-yellow-400" />
                                                            {data.totalCoins}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <p className="text-center text-slate-400 text-xs mt-4 italic">Tip: Click a quest row to view detailed student scores and the learning curve below.</p>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-8 w-1 bg-green-500 rounded-full"></div>
                                <h3 className="text-xl font-bold text-deep-blue">
                                    Student Performance Overview (All Quests)
                                </h3>
                            </div>

                            {/* Learning Curve Chart */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                                <h4 className="text-lg font-bold text-deep-blue mb-4 text-center">Class Learning Progression (Gain %)</h4>
                                <div className="h-80 w-full">
                                    {(() => {
                                        // Create a multi-line data structure for all 4 quests
                                        const chartData = classStudents.map(student => {
                                            const row: any = { name: student.name };
                                            ([1, 2, 3, 4] as QuestId[]).forEach(qId => {
                                                const p = student.progress?.questProgress?.[qId];
                                                if (p?.preTestScore !== undefined && p?.postTestScore !== undefined) {
                                                    const normPre = normalizeScore(p.preTestScore, qId);
                                                    const normPost = normalizeScore(p.postTestScore, qId);
                                                    row[`q${qId}`] = normPost - normPre;
                                                }
                                            });
                                            return row;
                                        }).filter(row => Object.keys(row).length > 1);

                                        if (chartData.length === 0) {
                                            return (
                                                <div className="flex items-center justify-center h-full text-slate-400">
                                                    No student data available to generate the progression chart.
                                                </div>
                                            );
                                        }

                                        return (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
                                                    <YAxis tickFormatter={(val) => `${val > 0 ? '+' : ''}${val}%`} />
                                                    <Tooltip
                                                        formatter={(val: number) => [`${val > 0 ? '+' : ''}${val}%`, 'Gain']}
                                                    />
                                                    <Legend verticalAlign="top" height={36} />
                                                    <Line type="monotone" dataKey="q1" name="Quest 1" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                                                    <Line type="monotone" dataKey="q2" name="Quest 2" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                                                    <Line type="monotone" dataKey="q3" name="Quest 3" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                                                    <Line type="monotone" dataKey="q4" name="Quest 4" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} connectNulls />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* All Quests Student Table */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-200">
                                            <tr>
                                                <th className="p-4 sticky left-0 bg-slate-50 z-10 w-48">Student</th>
                                                {([1, 2, 3, 4] as QuestId[]).map(qId => (
                                                    <th key={qId} className="p-4 text-center min-w-[140px]">
                                                        {['✏️ Q1', '🧩 Q2', '🔢 Q3', '➕ Q4'][qId - 1]}
                                                    </th>
                                                ))}
                                                <th className="p-4 text-center">Total Coins</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {classStudents.map(student => {
                                                const totalStudentCoins = [1, 2, 3, 4].reduce((sum, qId) => {
                                                    return sum + (student.progress?.questProgress?.[qId as QuestId]?.coinsEarned || 0);
                                                }, 0);

                                                return (
                                                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50/50 z-10 border-r border-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xl">{student.avatar}</span>
                                                                <span className="font-bold text-deep-blue">{student.name}</span>
                                                            </div>
                                                        </td>
                                                        {([1, 2, 3, 4] as QuestId[]).map(qId => {
                                                            const p = student.progress?.questProgress?.[qId];
                                                            const isCompleted = !!p?.completed;
                                                            const isStarted = !!p?.startedAt;
                                                            const pre = normalizeScore(p?.preTestScore, qId);
                                                            const post = normalizeScore(p?.postTestScore, qId);
                                                            const gain = (post !== undefined && pre !== undefined) ? post - pre : null;

                                                            return (
                                                                <td key={qId} className="p-4">
                                                                    {!isStarted ? (
                                                                        <div className="text-center text-slate-300 text-xs">Not Started</div>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center gap-1">
                                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                                                <span>{pre}%</span>
                                                                                <ArrowLeft className="w-2 h-2 rotate-180" />
                                                                                <span className="text-deep-blue">{post}%</span>
                                                                            </div>
                                                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                                                                <div
                                                                                    className="h-full bg-slate-400"
                                                                                    style={{ width: `${pre}%` }}
                                                                                />
                                                                                <div
                                                                                    className="h-full bg-green-500"
                                                                                    style={{ width: `${Math.max(0, post - pre)}%` }}
                                                                                />
                                                                            </div>
                                                                            {gain !== null && gain !== 0 && (
                                                                                <span className={`text-[10px] font-bold ${gain > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                                                    {gain > 0 ? '+' : ''}{gain}%
                                                                                </span>
                                                                            )}
                                                                            {isCompleted && <span className="text-[10px] text-green-600 font-bold">✅</span>}
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="p-4 text-center">
                                                            <div className="flex items-center justify-center gap-1 text-amber-500 font-bold">
                                                                <Coins className="w-4 h-4 fill-amber-400" />
                                                                {totalStudentCoins}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Supplementary Details */}
                {classStudents.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        {/* Interaction Log Summary */}
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-aqua-blue p-6">
                            <h2 className="text-xl font-bold text-deep-blue mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Class Interactions (Quest {selectedQuest})
                            </h2>
                            <div className="space-y-3 text-deep-blue/80 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="flex justify-between items-center border-b border-slate-200 pb-2">
                                    <span>Total Interactions:</span>
                                    <span className="font-bold text-lg">{aggregatedInteractions.total}</span>
                                </p>
                                <p className="flex justify-between items-center text-sm">
                                    <span>Pre-Test Attempts:</span>
                                    <span className="font-semibold text-slate-600">
                                        {aggregatedInteractions.preTest}
                                    </span>
                                </p>
                                <p className="flex justify-between items-center text-sm">
                                    <span>Practice Attempts:</span>
                                    <span className="font-semibold text-slate-600">
                                        {aggregatedInteractions.practice}
                                    </span>
                                </p>
                                <p className="flex justify-between items-center text-sm">
                                    <span>Post-Test Attempts:</span>
                                    <span className="font-semibold text-slate-600">
                                        {aggregatedInteractions.postTest}
                                    </span>
                                </p>
                                <p className="flex justify-between items-center text-sm">
                                    <span>Story Interactions:</span>
                                    <span className="font-semibold text-slate-600">
                                        {aggregatedInteractions.story}
                                    </span>
                                </p>
                            </div>

                            <div className="mt-4 p-4 bg-aqua-blue/10 rounded-xl text-deep-blue/70 text-sm flex items-start gap-3 border border-aqua-blue/20">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-aqua-blue" />
                                <p>
                                    <strong>Data Format:</strong> All interactions are locally logged with quest_id, scene_id, number,
                                    correct_flag, and time_ms for session research analysis.
                                </p>
                            </div>
                        </div>

                        {/* Research Notes */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl shadow-xl p-6 border-4 border-purple-400">
                            <h3 className="text-xl font-bold text-deep-blue mb-4">📊 For Research Teams</h3>
                            <div className="text-deep-blue/80 text-sm space-y-3">
                                <div className="flex gap-2 items-start">
                                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                    <p>Data format matches Quests 1 & 2 structure for consistent analysis across modules.</p>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                    <p>Each interaction includes timestamp, student response, and correctness flag.</p>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                    <p>Exported JSON files can be merged with other quest data for longitudinal analysis.</p>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                    <p>Pre/post test items are identical (0, 1, 5, 9) for valid comparison.</p>
                                </div>
                                <div className="flex gap-2 items-start">
                                    <div className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                                    <p>"I don't know yet" responses logged with null correct_flag to distinguish from wrong answers.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Student Analytics Modal */}
                <AnimatePresence>
                    {viewingStudent && (
                        <div className="fixed inset-0 bg-deep-blue/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="bg-deep-blue text-white p-6 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className="text-5xl bg-white/10 p-3 rounded-2xl">{viewingStudent.avatar}</div>
                                        <div>
                                            <h2 className="text-2xl font-bold">{viewingStudent.name}</h2>
                                            <div className="flex gap-4 text-white/80 text-sm mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Trophy className="w-4 h-4 text-sunburst-yellow" />
                                                    Level {viewingStudent.progress?.level || 1}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Coins className="w-4 h-4 text-amber-400" />
                                                    {viewingStudent.progress?.totalCoins || 0} Coins
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewingStudent(null)} className="p-2 text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto flex-1">
                                    <h3 className="text-lg font-bold text-deep-blue flex items-center gap-2 mb-4">
                                        <BarChart2 className="w-5 h-5" />
                                        Performance Analytics
                                    </h3>

                                    <div className="mb-4 flex justify-end">
                                        <button
                                            onClick={() => handleExportJSON(viewingStudent)}
                                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Export Learning Data (JSON)
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <table className="w-full text-left">
                                            <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold border-b border-slate-200">
                                                <tr>
                                                    <th className="p-3">Quest</th>
                                                    <th className="p-3">Status</th>
                                                    <th className="p-3 text-center">Pre-Test</th>
                                                    <th className="p-3 text-center">Post-Test</th>
                                                    <th className="p-3 text-center">Gain</th>
                                                    <th className="p-3 text-center">Time</th>
                                                    <th className="p-3 text-right">Completed</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {[1, 2, 3, 4].map(qId => {
                                                    const progress = viewingStudent.progress?.questProgress?.[qId as QuestId];
                                                    const isCompleted = progress?.completed;
                                                    const isStarted = !!progress?.startedAt;
                                                    const rawPre = progress?.preTestScore;
                                                    const rawPost = progress?.postTestScore;
                                                    const pre = normalizeScore(rawPre, qId as QuestId);
                                                    const post = normalizeScore(rawPost, qId as QuestId);
                                                    const gain = (rawPost !== undefined && rawPre !== undefined) ? post - pre : null;
                                                    const duration = calculateDuration(progress?.startedAt, progress?.completedAt);

                                                    return (
                                                        <tr key={qId} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="p-3 font-bold text-deep-blue">Quest {qId}</td>
                                                            <td className="p-3">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${isCompleted ? 'bg-green-100 text-green-700' :
                                                                    isStarted ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-slate-100 text-slate-500'
                                                                    }`}>
                                                                    {isCompleted ? '✅ Completed' : isStarted ? '⏳ In Progress' : '🔒 Not Started'}
                                                                </span>
                                                            </td>
                                                            <td className="p-3 text-center font-mono text-slate-600">
                                                                {rawPre !== undefined ? `${pre}%` : '-'}
                                                            </td>
                                                            <td className="p-3 text-center font-mono font-bold text-deep-blue">
                                                                {rawPost !== undefined ? `${post}%` : '-'}
                                                            </td>
                                                            <td className="p-3 text-center">
                                                                {gain !== null ? (
                                                                    <span className={`font-bold ${gain > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                                                                        {gain > 0 ? `+${gain}%` : `${gain}%`}
                                                                    </span>
                                                                ) : '-'}
                                                            </td>
                                                            <td className="p-3 text-center text-sm text-slate-500">
                                                                {duration}
                                                            </td>
                                                            <td className="p-3 text-right text-sm text-slate-500">
                                                                {progress?.completedAt ? new Date(progress.completedAt).toLocaleDateString() : '-'}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="p-4 border-t-2 border-slate-100 bg-slate-50 flex justify-end">
                                    <Button variant="outline" onClick={() => setViewingStudent(null)} className="px-6 py-3 rounded-xl border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold">
                                        Close
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Add Student Modal */}
                <AnimatePresence>
                    {isEditingModalOpen && (
                        <div className="fixed inset-0 bg-deep-blue/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                            >
                                <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h2 className="text-2xl font-bold text-deep-blue">{editingStudentId ? "Edit Student" : "Add New Student"}</h2>
                                    <button onClick={() => setIsEditingModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="p-8 overflow-y-auto flex-1">
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 border border-red-200">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    {/* Name & Avatar */}
                                    <div className="mb-8 select-none">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Student Name</label>
                                        <input
                                            type="text"
                                            value={newStudentName}
                                            onChange={(e) => setNewStudentName(e.target.value)}
                                            placeholder="E.g., Sarah"
                                            className="w-full text-2xl p-4 bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/20 transition-all outline-none text-deep-blue font-semibold"
                                            autoFocus
                                        />
                                    </div>

                                    <div className="mb-8 select-none">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Choose Avatar</label>
                                        <div className="flex flex-wrap gap-3">
                                            {AVATARS.map(avatar => (
                                                <button
                                                    key={avatar}
                                                    onClick={() => setSelectedAvatar(avatar)}
                                                    className={`text-5xl p-3 rounded-2xl transition-all border-4 ${selectedAvatar === avatar ? 'bg-brand-blue/10 border-brand-blue scale-110 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100 hover:scale-105'}`}
                                                >
                                                    {avatar}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Password Builder */}
                                    <div className="select-none">
                                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Set Picture Password (3 Emojis)</label>

                                        <div className="flex gap-4 mb-6 justify-center">
                                            {[0, 1, 2].map((idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border-4 transition-all duration-300 ${newPassword[idx] ? 'bg-white border-brand-blue shadow-sm' : 'bg-slate-50 border-slate-200 dashed'
                                                        }`}
                                                >
                                                    {newPassword[idx] || ''}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-5 sm:grid-cols-5 gap-3 max-w-sm mx-auto">
                                            {EMOJI_GRID.map((emoji) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => handleAddEmoji(emoji)}
                                                    disabled={newPassword.length >= 3}
                                                    className="text-4xl aspect-square bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-slate-200 hover:border-brand-blue disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-sm"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                            <button
                                                onClick={handleRemoveEmoji}
                                                disabled={newPassword.length === 0}
                                                className="text-sm font-bold aspect-square bg-red-50 text-red-500 hover:bg-red-100 rounded-xl border-2 border-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center shadow-sm col-span-1"
                                            >
                                                DEL
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 border-t-2 border-slate-100 bg-slate-50 flex justify-end gap-4">
                                    <Button variant="outline" onClick={() => setIsEditingModalOpen(false)} className="px-6 py-6 text-lg rounded-xl border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveStudent}
                                        className="px-8 py-6 text-lg rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg shadow-green-500/30"
                                    >
                                        Save Student
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
