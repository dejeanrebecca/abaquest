import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { StudentProfile } from '../../types/quest';
import { LogOut, Plus, Trash2, X, Users, ShieldCheck, BookOpen, Edit2 } from 'lucide-react';
import { studentService } from '../../services/studentService';

interface AdminDashboardProps {
    allProfiles: StudentProfile[];
    onUpdateProfiles: (profiles: StudentProfile[]) => void;
    onLogout: () => void;
    onManageClass?: () => void; // Optional callback for hybrid role
}

export function AdminDashboard({ allProfiles, onUpdateProfiles, onLogout, onManageClass }: AdminDashboardProps) {
    const [isAddingTeacher, setIsAddingTeacher] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<StudentProfile | null>(null);
    const [newTeacher, setNewTeacher] = useState({
        name: '',
        avatar: '👨‍🏫',
        emojiPass: ['🍎', '🍎', '🍎']
    });

    const teachers = useMemo(() =>
        allProfiles.filter(p => p.role === 'teacher'),
        [allProfiles]);
    const handleAddTeacher = async () => {
        if (!newTeacher.name.trim()) return;

        const teacherId = `teacher_${Date.now()}`;
        const profile: StudentProfile = {
            id: teacherId,
            name: newTeacher.name,
            avatar: newTeacher.avatar,
            emojiPass: newTeacher.emojiPass,
            gradeLevel: 'K',
            role: 'teacher',
            progress: {
                studentName: newTeacher.name,
                emotionalState: '',
                totalCoins: 0,
                level: 1,
                xp: 0,
                completedQuests: [],
                currentQuestId: 1,
                questProgress: {} as any,
            }
        };

        // Optimistic update: Update local state immediately
        const previousProfiles = [...allProfiles];
        const updatedProfiles = [...allProfiles, profile];
        onUpdateProfiles(updatedProfiles);

        // Sync to localStorage
        localStorage.setItem('abaquest_students', JSON.stringify(updatedProfiles));

        setIsAddingTeacher(false);
        setNewTeacher({ name: '', avatar: '👨‍🏫', emojiPass: ['🍎', '🍎', '🍎'] });

        try {
            await studentService.saveProfile(profile);
        } catch (error) {
            console.error("Failed to add teacher:", error);
            // Rollback on error
            onUpdateProfiles(previousProfiles);
            alert("Failed to save teacher to cloud. Please check your connection.");
        }
    };

    const handleEditTeacher = async () => {
        if (!editingTeacher || !editingTeacher.name.trim()) return;

        const previousProfiles = [...allProfiles];
        const updatedProfiles = allProfiles.map(p => p.id === editingTeacher.id ? editingTeacher : p);
        onUpdateProfiles(updatedProfiles);
        localStorage.setItem('abaquest_students', JSON.stringify(updatedProfiles));

        setEditingTeacher(null);

        try {
            await studentService.saveProfile(editingTeacher);
        } catch (error) {
            console.error("Failed to edit teacher:", error);
            // Rollback on error
            onUpdateProfiles(previousProfiles);
            alert("Failed to save teacher to cloud. Please check your connection.");
        }
    };

    const handleDeleteTeacher = async (teacherId: string) => {
        if (!confirm("Are you sure? This will remove the teacher and all their student data.")) return;

        try {
            await studentService.deleteProfile(teacherId);
            const updatedProfiles = allProfiles.filter(p => p.id !== teacherId);
            onUpdateProfiles(updatedProfiles);
            localStorage.setItem('abaquest_students', JSON.stringify(updatedProfiles));
        } catch (error) {
            console.error("Failed to delete teacher:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8">
            <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border-2 border-slate-200">
                <div className="flex items-center gap-4">
                    <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Ameerah's Command Center</h1>
                        <p className="text-slate-500">Managing {teachers.length} Active Teachers</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    {onManageClass && (
                        <Button
                            variant="default"
                            onClick={onManageClass}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-2xl shadow-md border-none px-6"
                        >
                            <BookOpen className="w-5 h-5 mr-2" />
                            Manage My Class
                        </Button>
                    )}
                    <Button variant="outline" onClick={onLogout} className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 rounded-2xl">
                        <LogOut className="w-5 h-5 mr-2" />
                        Logout
                    </Button>
                </div>
            </header>

            <div className="max-w-5xl mx-auto w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-700 flex items-center gap-2">
                        <Users className="w-6 h-6 text-blue-500" />
                        Teacher Directory
                    </h2>
                    <Button onClick={() => setIsAddingTeacher(true)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md border-none px-6">
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Teacher
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teachers.map(teacher => (
                        <motion.div
                            key={teacher.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center relative group"
                        >
                            <div className="absolute top-4 right-4 flex gap-1 z-10">
                                <button
                                    onClick={() => setEditingTeacher(teacher)}
                                    className="text-slate-300 hover:text-blue-500 transition-colors p-2"
                                    title="Edit Teacher"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteTeacher(teacher.id)}
                                    className="text-slate-300 hover:text-red-500 transition-colors p-2"
                                    title="Remove Teacher"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="text-6xl mb-4 bg-slate-50 p-4 rounded-3xl group-hover:scale-110 transition-transform">{teacher.avatar}</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">{teacher.name}</h3>
                            <div className="bg-slate-50 rounded-lg px-4 py-2 flex gap-1 mb-4 border border-slate-100">
                                {teacher.emojiPass.map((emoji, idx) => (
                                    <span key={idx} className="text-xl">{emoji}</span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Add Teacher Modal */}
            <AnimatePresence>
                {isAddingTeacher && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-xl font-bold text-slate-800">Add New Teacher</h3>
                                <button onClick={() => setIsAddingTeacher(false)} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">TEACHER NAME</label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full text-2xl p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none"
                                        value={newTeacher.name}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">CHOOSE AVATAR</label>
                                        <div className="flex flex-wrap gap-2 text-3xl p-3 bg-slate-50 rounded-2xl">
                                            {['👨‍🏫', '👩‍🏫', '🏫', '🍎', '🎓'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => setNewTeacher({ ...newTeacher, avatar: emoji })}
                                                    className={`p-2 rounded-xl transition-all ${newTeacher.avatar === emoji ? 'bg-blue-100 scale-110 shadow-sm border-2 border-blue-300' : 'hover:bg-white'}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">EMOJI PASSCODE</label>
                                        <div className="flex gap-2 text-3xl p-3 bg-slate-50 rounded-2xl">
                                            {newTeacher.emojiPass.map((emoji, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        const emojis = ['🔑', '⭐', '🍎', '🐶', '🚗', '🎈'];
                                                        const currentIdx = emojis.indexOf(emoji);
                                                        const nextEmoji = emojis[(currentIdx + 1) % emojis.length];
                                                        const newPass = [...newTeacher.emojiPass];
                                                        newPass[idx] = nextEmoji;
                                                        setNewTeacher({ ...newTeacher, emojiPass: newPass });
                                                    }}
                                                    className="p-1 hover:bg-white rounded-lg transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 italic">Click to cycle emojis</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleAddTeacher}
                                    disabled={!newTeacher.name.trim()}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 text-xl shadow-lg border-none"
                                >
                                    Save Profile
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Teacher Modal */}
            <AnimatePresence>
                {editingTeacher && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                <h3 className="text-xl font-bold text-slate-800">Edit Teacher</h3>
                                <button onClick={() => setEditingTeacher(null)} className="text-slate-400 hover:text-slate-600 p-1">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 mb-2">TEACHER NAME</label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full text-2xl p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-blue-500 focus:outline-none"
                                        value={editingTeacher.name}
                                        onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">CHOOSE AVATAR</label>
                                        <div className="flex flex-wrap gap-2 text-3xl p-3 bg-slate-50 rounded-2xl">
                                            {['👨‍🏫', '👩‍🏫', '🏫', '🍎', '🎓'].map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => setEditingTeacher({ ...editingTeacher, avatar: emoji })}
                                                    className={`p-2 rounded-xl transition-all ${editingTeacher.avatar === emoji ? 'bg-blue-100 scale-110 shadow-sm border-2 border-blue-300' : 'hover:bg-white'}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-500 mb-2">EMOJI PASSCODE</label>
                                        <div className="flex gap-2 text-3xl p-3 bg-slate-50 rounded-2xl">
                                            {editingTeacher.emojiPass.map((emoji, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        const emojis = ['🔑', '⭐', '🍎', '🐶', '🚗', '🎈'];
                                                        const currentIdx = emojis.indexOf(emoji);
                                                        const nextEmoji = emojis[(currentIdx + 1) % emojis.length];
                                                        const newPass = [...editingTeacher.emojiPass];
                                                        newPass[idx] = nextEmoji;
                                                        setEditingTeacher({ ...editingTeacher, emojiPass: newPass });
                                                    }}
                                                    className="p-1 hover:bg-white rounded-lg transition-colors"
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1 italic">Click to cycle emojis</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleEditTeacher}
                                    disabled={!editingTeacher.name.trim()}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 text-xl shadow-lg border-none"
                                >
                                    Save Changes
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
