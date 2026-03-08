const fs = require('fs');
let code = fs.readFileSync('src/components/auth/TeacherRosterDashboard.tsx', 'utf8');

// 1. Add onUpdateProfiles to Props
code = code.replace(
    'onLogout: () => void;',
    'onLogout: () => void;\\n    onUpdateProfiles?: (profiles: StudentProfile[]) => void;'
).replace(
    'export function TeacherRosterDashboard({ teacher, allProfiles, onLogout }: TeacherDashboardProps) {',
    'export function TeacherRosterDashboard({ teacher, allProfiles, onLogout, onUpdateProfiles }: TeacherDashboardProps) {'
);

// 2. Resolve Imports
const importsUpstream = \`<<<<<<< Updated upstream
import { LogOut, Plus, Trash2, X, AlertCircle, Edit2 } from 'lucide-react';
import { DbService } from '../../services/db.service';
=======
import { LogOut, Plus, Trash2, X, AlertCircle, Loader2, BarChart2, Trophy, Coins, Download, TrendingUp } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { QuestId } from '../../types/quest';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
>>>>>>> Stashed changes\`;

const importsResolved = \`import { LogOut, Plus, Trash2, X, AlertCircle, Edit2, Loader2, BarChart2, Trophy, Coins, Download, TrendingUp } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { QuestId } from '../../types/quest';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';\`;

code = code.replace(importsUpstream, importsResolved);

// 3. Resolve save calls inside the component before conflict 2
code = code.replace(
  'await DbService.updateProfile(updatedStudent);',
  \`await studentService.saveProfile(updatedStudent);
                if (onUpdateProfiles) onUpdateProfiles(allProfiles.map(p => p.id === updatedStudent.id ? updatedStudent : p));\`
).replace(
  'await DbService.addProfile(newStudent);',
  \`await studentService.saveProfile(newStudent);
            if (onUpdateProfiles) onUpdateProfiles([...allProfiles, newStudent]);\`
);

// 4. Resolve Conflict 2: handleDeleteStudent
const conflict2Upstream = \`<<<<<<< Updated upstream
        setIsEditingModalOpen(false);
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (window.confirm('Are you sure you want to delete this student? All their progress will be lost.')) {
            await DbService.deleteProfile(studentId);
        }
    };

    const modalTitle = editingStudentId ? "Edit Student" : "Add New Student";
=======\`;

const conflict2Resolved = \`        setIsEditingModalOpen(false);
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

    const modalTitle = editingStudentId ? "Edit Student" : "Add New Student";\`;

code = code.replace(conflict2Upstream, conflict2Resolved);

// Keep everything after ======= and REMOVE duplicate handleDeleteStudent in Stash
const stashBlockLengthStart = code.indexOf('        try {\\n            await studentService.saveProfile(newStudent);');
const stashBlockLengthEnd = code.indexOf('    const calculateDuration = (start?: string, end?: string) => {');

if (stashBlockLengthStart !== -1 && stashBlockLengthEnd !== -1) {
  code = code.substring(0, stashBlockLengthStart) + code.substring(stashBlockLengthEnd);
}

code = code.replace('>>>>>>> Stashed changes\\n', '');

// 5. Resolve Conflict 3: Action Buttons
const conflict3 = \`<<<<<<< Updated upstream
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
                                        </button>\`;

const conflict3Resolved = \`                                        <div className="flex gap-2">
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
                                        </div>\`;

code = code.replace(conflict3, conflict3Resolved);

// 6. Resolve Conflict 4: Modal Location
const conflict4 = \`<<<<<<< Updated upstream
            {/* Add/Edit Student Modal */}
=======\`;
code = code.replace(conflict4, \`            {/* Add/Edit Student Modal */}\`);

fs.writeFileSync('src/components/auth/TeacherRosterDashboard.tsx', code);
console.log('Merge complete.');
