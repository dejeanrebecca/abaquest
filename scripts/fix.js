const fs = require('fs');

let code = fs.readFileSync('src/components/auth/TeacherRosterDashboard.tsx', 'utf8');

// 1. Add onUpdateProfiles
code = code.replace(
    'onLogout: () => void;',
    'onLogout: () => void;\n    onUpdateProfiles?: (profiles: StudentProfile[]) => void;'
);
code = code.replace(
    'export function TeacherRosterDashboard({ teacher, allProfiles, onLogout }: TeacherDashboardProps) {',
    'export function TeacherRosterDashboard({ teacher, allProfiles, onLogout, onUpdateProfiles }: TeacherDashboardProps) {'
);

// 2. Imports
code = code.replace(
    `<<<<<<< Updated upstream
import { LogOut, Plus, Trash2, X, AlertCircle, Edit2 } from 'lucide-react';
import { DbService } from '../../services/db.service';
=======
import { LogOut, Plus, Trash2, X, AlertCircle, Loader2, BarChart2, Trophy, Coins, Download, TrendingUp } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { QuestId } from '../../types/quest';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
>>>>>>> Stashed changes`,
    `import { LogOut, Plus, Trash2, X, AlertCircle, Edit2, Loader2, BarChart2, Trophy, Coins, Download, TrendingUp } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { QuestId } from '../../types/quest';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';`
);

// 3. DbService calls inside save
code = code.replace(
    `                };
                await DbService.updateProfile(updatedStudent);`,
    `                };
                await studentService.saveProfile(updatedStudent);
                if (onUpdateProfiles) onUpdateProfiles(allProfiles.map(p => p.id === updatedStudent.id ? updatedStudent : p));`
);

code = code.replace(
    `            };
            await DbService.addProfile(newStudent);`,
    `            };
            await studentService.saveProfile(newStudent);
            if (onUpdateProfiles) onUpdateProfiles([...allProfiles, newStudent]);`
);


// 4. conflict markers in save
code = code.replace(
    `<<<<<<< Updated upstream
        setIsEditingModalOpen(false);
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (window.confirm('Are you sure you want to delete this student? All their progress will be lost.')) {
            await DbService.deleteProfile(studentId);
        }
    };

    const modalTitle = editingStudentId ? "Edit Student" : "Add New Student";
=======`,
    `        setIsEditingModalOpen(false);
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (window.confirm('Are you sure you want to delete this student? All their progress will be lost.')) {
            try {
                await studentService.deleteProfile(studentId);
                const updatedProfiles = allProfiles.filter(p => p.id !== studentId);
                if (onUpdateProfiles) onUpdateProfiles(updatedProfiles);
            } catch (error) {
                alert('Failed to delete student from cloud.');
            }
        }
    };

    const modalTitle = editingStudentId ? "Edit Student" : "Add New Student";`
);

code = code.replace(
    `        try {
            await studentService.saveProfile(newStudent);

            // UI will update via parent's hook subscription, 
            // but we call onUpdateProfiles to keep local state stable if needed.
            onUpdateProfiles([...allProfiles, newStudent]);

            // Reset form
            setIsAddingStudent(false);
            setNewStudentName('');
            setSelectedAvatar(AVATARS[0]);
            setNewPassword([]);
        } catch (error) {
            setError('Failed to save student to cloud. Please try again.');
        } finally {
            setIsSaving(false);
        }
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
    };`,
    ``
);

code = code.replace(
    `>>>>>>> Stashed changes`,
    ``
);

// 5. Buttons conflict
code = code.replace(
    `<<<<<<< Updated upstream
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => openModalForEdit(student)}
                                                className="text-slate-400 hover:text-blue-500 transition-colors p-2 bg-white rounded-full hover:bg-blue-50"
                                                title="Edit Student"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStudent(student.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-white rounded-full hover:bg-red-50"
                                                title="Delete Student"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
=======
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteStudent(student.id); }}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-white rounded-full hover:bg-red-50"
                                            title="Delete Student"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
>>>>>>> Stashed changes`,
    `                                        <div className="flex gap-2">
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
                                        </div>`
);

// 6. Analytics modal conflict
code = code.replace(
    `<<<<<<< Updated upstream
            {/* Add/Edit Student Modal */}
=======`,
    `            {/* Add/Edit Student Modal */}`
);
code = code.replace(
    `>>>>>>> Stashed changes`,
    ``
);

fs.writeFileSync('src/components/auth/TeacherRosterDashboard.tsx', code);
console.log('Fixed');
