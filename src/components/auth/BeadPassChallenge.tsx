import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { Button } from '../ui/button';
import { validateBeadPass } from '../../utils/auth';
import { StudentProfile } from '../../types/quest';
import { CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { useAbacusSound } from '../../hooks/useAbacusSound';

interface BeadPassChallengeProps {
    student: StudentProfile;
    onSuccess: () => void;
    onBack: () => void;
}

export function BeadPassChallenge({ student, onSuccess, onBack }: BeadPassChallengeProps) {
    const [currentPattern, setCurrentPattern] = useState<number[]>([0]); // Default 0
    const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const { playSuccess, playClick } = useAbacusSound();

    const handleCheck = async () => {
        setStatus('validating');
        const isValid = await validateBeadPass(currentPattern, student.beadPassHash);

        if (isValid) {
            setStatus('success');
            playSuccess();
            setTimeout(onSuccess, 1000);
        } else {
            setStatus('error');
            playClick(); // Error sound placeholder
            setTimeout(() => setStatus('idle'), 2000);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center w-full max-w-lg mx-auto"
        >
            <div className="w-full flex justify-start mb-4">
                <Button variant="ghost" onClick={onBack} className="text-deep-blue hover:bg-white/20">
                    <ArrowLeft className="w-6 h-6 mr-2" />
                    Back
                </Button>
            </div>

            <div className="text-center mb-8">
                <div className="text-6xl mb-4 animate-bounce">{student.avatar}</div>
                <h2 className="text-3xl text-deep-blue font-bold mb-2">Welcome, {student.name}!</h2>
                <p className="text-xl text-deep-blue/80">Show me your secret bead pattern!</p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-deep-blue mb-8">
                <InteractiveAbacus
                    rods={1}
                    onChange={(val) => setCurrentPattern([val])}
                    interactive={status !== 'success'}
                />
            </div>

            <AnimatePresence mode="wait">
                {status === 'error' ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-orange-100 border-2 border-orange-400 text-orange-800 px-6 py-3 rounded-xl flex items-center gap-2 mb-6"
                    >
                        <XCircle className="w-6 h-6" />
                        <span className="font-bold">Oops! Try again!</span>
                    </motion.div>
                ) : status === 'success' ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-100 border-2 border-green-500 text-green-800 px-6 py-3 rounded-xl flex items-center gap-2 mb-6"
                    >
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-bold">Correct! Logging in...</span>
                    </motion.div>
                ) : (
                    <div className="h-16 mb-6" /> // Spacer
                )}
            </AnimatePresence>

            <Button
                onClick={handleCheck}
                disabled={status === 'validating' || status === 'success'}
                className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl text-xl font-bold"
            >
                {status === 'validating' ? 'Checking...' : 'Unlock! 🔓'}
            </Button>
        </motion.div>
    );
}
