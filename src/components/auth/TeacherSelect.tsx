import { motion } from 'motion/react';
import { StudentProfile } from '../../types/quest';

interface TeacherSelectProps {
    teachers: StudentProfile[];
    onSelect: (teacher: StudentProfile) => void;
}

export function TeacherSelect({ teachers, onSelect }: TeacherSelectProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {teachers.map((teacher, index) => (
                <motion.button
                    key={teacher.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelect(teacher)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center bg-white rounded-3xl p-6 shadow-xl border-4 border-transparent hover:border-sunburst-yellow transition-all aspect-square"
                >
                    <div className="text-6xl mb-4">{teacher.avatar}</div>
                    <h3 className="text-2xl font-bold text-deep-blue">{teacher.name}</h3>
                    <p className="text-sm text-gray-500 mt-2">{teacher.role === 'admin' ? 'Super Admin' : 'Teacher'}</p>
                </motion.button>
            ))}
        </div>
    );
}
