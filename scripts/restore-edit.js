const fs = require('fs');
let code = fs.readFileSync('src/components/auth/TeacherRosterDashboard.tsx', 'utf8');

// 1. Add missing state and handlers
code = code.replace(
  'const [isAddingStudent, setIsAddingStudent] = useState(false);',
  `const [isEditingModalOpen, setIsEditingModalOpen] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);`
);

code = code.replace(
  'const handleRemoveEmoji = () => {',
  `const openModalForAdd = () => {
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

    const handleRemoveEmoji = () => {`
);

// 2. Fix save logic
code = code.replace(
  `        const newStudent: StudentProfile = {
            id: \\\`student_\\\${Date.now()}\\\`,
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

        try {
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
        }`,
  `        try {
            if (editingStudentId) {
                // Edit existing student
                const existingStudent = allProfiles.find(p => p.id === editingStudentId);
                if (existingStudent) {
                    const updatedStudent: StudentProfile = {
                        ...existingStudent,
                        name: newStudentName.trim(),
                        avatar: selectedAvatar,
                        emojiPass: [...newPassword],
                        progress: {
                            ...existingStudent.progress,
                            studentName: newStudentName.trim(),
                        }
                    };
                    await studentService.saveProfile(updatedStudent);
                    onUpdateProfiles(allProfiles.map(p => p.id === updatedStudent.id ? updatedStudent : p));
                }
            } else {
                // Add new student
                const newStudent: StudentProfile = {
                    id: \\\`student_\\\${Date.now()}\\\`,
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
                await studentService.saveProfile(newStudent);
                onUpdateProfiles([...allProfiles, newStudent]);
            }

            // Reset form
            setIsEditingModalOpen(false);
            setNewStudentName('');
            setSelectedAvatar(AVATARS[0]);
            setNewPassword([]);
        } catch (error) {
            setError('Failed to save student to cloud. Please try again.');
        } finally {
            setIsSaving(false);
        }`
);

// 3. Fix modal title
code = code.replace(
  'const calculateDuration',
  `const modalTitle = editingStudentId ? "Edit Student" : "Add New Student";

    const calculateDuration`
);

// 4. Update UI references
code = code.replace(
  'onClick={() => setIsAddingStudent(true)}',
  'onClick={openModalForAdd}'
);

code = code.replace(
  '{isAddingStudent && (',
  '{isEditingModalOpen && ('
);

code = code.replace(
  '<h2 className="text-2xl font-bold text-deep-blue">Add New Student</h2>',
  '<h2 className="text-2xl font-bold text-deep-blue">{modalTitle}</h2>'
);

code = code.replace(
  'onClick={() => setIsAddingStudent(false)}',
  'onClick={() => setIsEditingModalOpen(false)}'
);

code = code.replace(
  'onClick={() => setIsAddingStudent(false)}',
  'onClick={() => setIsEditingModalOpen(false)}'
);

fs.writeFileSync('src/components/auth/TeacherRosterDashboard.tsx', code);
console.log('Restoration complete.');
