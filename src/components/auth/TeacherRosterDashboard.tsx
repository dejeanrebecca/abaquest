import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { StudentProfile } from '../../types/quest';
import { LogOut, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { DbService } from '../../services/db.service';

interface TeacherDashboardProps {
    teacher: StudentProfile;
    allProfiles: StudentProfile[];
    onLogout: () => void;
}

const AVATARS = ['👦', '👧', '👦🏽', '👧🏽', '👱‍♂️', '👱‍♀️', '🧑‍🦱', '👩‍🦱'];
const EMOJI_GRID = ['🐶', '🐱', '🍎', '🚗', '⭐', '☀️', '🌙', '🌳', '🌸'];

export function TeacherRosterDashboard({ teacher, allProfiles, onLogout }: TeacherDashboardProps) {
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
    const [newPassword, setNewPassword] = useState<string[]>([]);
    const [error, setError] = useState('');

    const classStudents = allProfiles.filter(p => p.teacherId === teacher.id);

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

        const newStudent: StudentProfile = {
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

        await DbService.addProfile(newStudent);

        // Reset form
        setIsAddingStudent(false);
        setNewStudentName('');
        setSelectedAvatar(AVATARS[0]);
        setNewPassword([]);
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (window.confirm('Are you sure you want to delete this student? All their progress will be lost.')) {
            await DbService.deleteProfile(studentId);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
            <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-sm border-2 border-deep-blue/10">
                <div className="flex items-center gap-4">
                    <div className="text-5xl">{teacher.avatar}</div>
                    <div>
                        <h1 className="text-3xl font-bold text-deep-blue">Welcome, {teacher.name}!</h1>
                        <p className="text-deep-blue/60">Manage your classroom</p>
                    </div>
                </div>
                <Button variant="outline" onClick={onLogout} className="text-deep-blue border-deep-blue hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                </Button>
            </header>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-deep-blue/5">
                <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-2xl font-bold text-deep-blue">Your Roster ({classStudents.length})</h2>
                    <Button onClick={() => setIsAddingStudent(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg px-6 py-2 rounded-xl border-none">
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
                                    className="bg-slate-50 rounded-2xl p-5 border-2 border-slate-200 flex flex-col justify-between"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="text-4xl bg-white p-2 rounded-xl shadow-sm border border-slate-100">{student.avatar}</div>
                                            <div>
                                                <h3 className="font-bold text-lg text-deep-blue">{student.name}</h3>
                                                <p className="text-sm text-slate-500">Level {student.progress.level}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteStudent(student.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-white rounded-full hover:bg-red-50"
                                            title="Delete Student"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password:</span>
                                        <div className="flex gap-1 text-2xl">
                                            {student.emojiPass?.map((emoji, idx) => (
                                                <span key={idx}>{emoji}</span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Student Modal */}
            <AnimatePresence>
                {isAddingStudent && (
                    <div className="fixed inset-0 bg-deep-blue/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-6 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50">
                                <h2 className="text-2xl font-bold text-deep-blue">Add New Student</h2>
                                <button onClick={() => setIsAddingStudent(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
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
                                <Button variant="outline" onClick={() => setIsAddingStudent(false)} className="px-6 py-6 text-lg rounded-xl border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold">
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveStudent} className="px-8 py-6 text-lg rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg shadow-green-500/30">
                                    Save Student
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
