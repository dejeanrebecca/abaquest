import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { AudioNarration } from '../AudioNarration';
import { useState } from 'react';

interface PostTestCheckInProps {
    onComplete: (emotion: string) => void;
}

export function PostTestCheckIn({ onComplete }: PostTestCheckInProps) {
    const [selectedEmotion, setSelectedEmotion] = useState('');

    const emotions = [
        { emoji: '😊', label: 'Excited!', value: 'excited', color: 'bg-green-100' },
        { emoji: '🙂', label: 'Good', value: 'good', color: 'bg-blue-100' },
        { emoji: '😐', label: 'Okay', value: 'okay', color: 'bg-yellow-100' },
        { emoji: '😟', label: 'Nervous', value: 'nervous', color: 'bg-orange-100' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-warm-neutral p-8"
        >
            <div className="flex justify-center mb-4">
                {/* Logo placeholder */}
            </div>

            <div className="max-w-3xl mx-auto">
                {/* Header Card */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 mb-6 shadow-xl text-white text-center">
                    <h2 className="text-3xl font-bold mb-2">My Feelings Check-In 💙</h2>
                    <p className="text-white/90">How do you feel about what you learned?</p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-500">
                    <AudioNarration
                        text="You did a great job today! Before we finish, how are you feeling about the Junior Counter? Be honest — your feelings are important!"
                        speaker="abby"
                        autoPlay
                    />

                    <div className="my-8">
                        <div className="grid grid-cols-2 gap-6">
                            {emotions.map((emotion, index) => (
                                <motion.button
                                    key={emotion.value}
                                    initial={{ scale: 0, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedEmotion(emotion.value)}
                                    className={`p-6 rounded-2xl border-4 transition-all duration-300 relative overflow-hidden ${selectedEmotion === emotion.value
                                        ? 'border-purple-500 bg-purple-50 scale-105 shadow-xl'
                                        : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="text-6xl mb-4 transform transition-transform hover:scale-110">
                                        {emotion.emoji}
                                    </div>
                                    <p className="text-xl font-bold text-deep-blue">{emotion.label}</p>

                                    {selectedEmotion === emotion.value && (
                                        <motion.div
                                            layoutId="check"
                                            className="absolute top-4 right-4 bg-purple-500 text-white rounded-full p-1"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8">
                        <Button
                            onClick={() => onComplete(selectedEmotion)}
                            disabled={!selectedEmotion}
                            className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            size="lg"
                        >
                            I'm Done! 🎉
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
