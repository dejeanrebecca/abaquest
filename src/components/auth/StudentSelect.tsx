import { motion } from 'motion/react';
import { StudentProfile } from '../../types/quest';

interface StudentSelectProps {
    students: StudentProfile[];
    onSelect: (student: StudentProfile) => void;
}

export function StudentSelect({ students, onSelect }: StudentSelectProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4">
            {students.map((student, index) => (
                <motion.button
                    key={student.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelect(student)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center justify-center bg-white rounded-3xl p-6 shadow-xl border-4 border-transparent hover:border-sunburst-yellow transition-all aspect-square"
                >
                    <div className="text-6xl mb-4">{student.avatar}</div>
                    <h3 className="text-2xl font-bold text-deep-blue">{student.name}</h3>
                </motion.button>
            ))}
        </div>
    );
}
