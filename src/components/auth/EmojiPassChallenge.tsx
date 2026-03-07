import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { StudentProfile } from '../../types/quest';
import { CheckCircle, XCircle, ArrowLeft, Delete } from 'lucide-react';
import { useAbacusSound } from '../../hooks/useAbacusSound';

interface EmojiPassChallengeProps {
    student: StudentProfile;
    onSuccess: () => void;
    onBack: () => void;
}

const EMOJI_GRID = ['🐶', '🐱', '🍎', '🚗', '⭐', '☀️', '🌙', '🌳', '🌸'];

export function EmojiPassChallenge({ student, onSuccess, onBack }: EmojiPassChallengeProps) {
    const [enteredPass, setEnteredPass] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'validating' | 'success' | 'error'>('idle');
    const { playSuccess, playClick, playError } = useAbacusSound();

    const handleEmojiClick = (emoji: string) => {
        if (status !== 'idle' || enteredPass.length >= 3) return;

        playClick();
        const newPass = [...enteredPass, emoji];
        setEnteredPass(newPass);

        if (newPass.length === 3) {
            validatePassword(newPass);
        }
    };

    const handleDelete = () => {
        if (enteredPass.length > 0 && status === 'idle') {
            playClick();
            setEnteredPass(enteredPass.slice(0, -1));
        }
    };

    const validatePassword = (attempt: string[]) => {
        setStatus('validating');

        // Simple array comparison
        const isValid = attempt.length === student.emojiPass.length && attempt.every((val, index) => val === student.emojiPass[index]);

        setTimeout(() => {
            if (isValid) {
                setStatus('success');
                playSuccess();
                setTimeout(onSuccess, 1000);
            } else {
                setStatus('error');
                playError(); // Use error sound if available
                setTimeout(() => {
                    setEnteredPass([]);
                    setStatus('idle');
                }, 1500);
            }
        }, 500);
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

            <div className="text-center mb-6">
                <div className="text-6xl mb-4 animate-bounce">{student.avatar}</div>
                <h2 className="text-3xl text-deep-blue font-bold mb-2">Welcome, {student.name}!</h2>
                <p className="text-xl text-deep-blue/80">Enter your secret picture password</p>
            </div>

            {/* Password Placeholders */}
            <div className="flex gap-4 mb-8 justify-center h-20">
                {[0, 1, 2].map((idx) => (
                    <div
                        key={idx}
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl border-4 transition-all duration-300 ${enteredPass[idx] ? 'bg-white border-brand-blue shadow-md scale-110' : 'bg-white/50 border-gray-300'
                            } ${status === 'error' ? 'animate-shake border-red-400 bg-red-50' : ''}`}
                    >
                        {enteredPass[idx] || ''}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {status === 'error' ? (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="bg-orange-100 border-2 border-orange-400 text-orange-800 px-6 py-3 rounded-xl flex items-center gap-2 mb-6 absolute bottom-0"
                        style={{ marginTop: '20px' }}
                    >
                        <XCircle className="w-6 h-6" />
                        <span className="font-bold">Oops! Try again!</span>
                    </motion.div>
                ) : status === 'success' ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-100 border-2 border-green-500 text-green-800 px-6 py-3 rounded-xl flex items-center gap-2 mb-6 absolute bottom-0"
                        style={{ marginTop: '20px' }}
                    >
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-bold">Correct! Logging in...</span>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* Emoji Grid */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border-4 border-deep-blue">
                <div className="grid grid-cols-3 gap-4">
                    {EMOJI_GRID.map((emoji) => (
                        <motion.button
                            key={emoji}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEmojiClick(emoji)}
                            disabled={status !== 'idle'}
                            className="w-20 h-20 text-5xl bg-gray-50 hover:bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-transparent hover:border-brand-blue transition-colors shadow-sm"
                        >
                            {emoji}
                        </motion.button>
                    ))}

                    {/* Empty cell to balance Grid */}
                    <div className="w-20 h-20"></div>

                    {/* Delete button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleDelete}
                        disabled={status !== 'idle' || enteredPass.length === 0}
                        className={`w-20 h-20 flex items-center justify-center rounded-2xl border-2 transition-colors ${enteredPass.length > 0 && status === 'idle'
                                ? 'bg-red-50 text-red-500 hover:bg-red-100 border-red-200 hover:border-red-400'
                                : 'bg-gray-50 text-gray-300 border-transparent'
                            }`}
                    >
                        <Delete className="w-10 h-10" />
                    </motion.button>
                    {/* Empty cell to balance Grid */}
                    <div className="w-20 h-20"></div>
                </div>
            </div>
        </motion.div>
    );
}
