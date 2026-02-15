import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import { JuniorCounter, JuniorCounterState } from '../JuniorCounter';
import { useAbacusSound } from '../../hooks/useAbacusSound';
import { Button } from '../ui/button';

interface Quest3PracticeProps {
    onComplete: () => void;
}

export function Quest3Practice({ onComplete }: Quest3PracticeProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const { logInteraction } = useDataLogger();
    const { playSuccess } = useAbacusSound();

    // Strict practice set: 0, 1, 5, 9
    const practiceNumbers = [0, 1, 5, 9];
    const currentPractice = practiceNumbers[currentQuestion];

    useEffect(() => {
        setStartTime(Date.now());
    }, [currentQuestion]);

    const handleStateChange = (state: JuniorCounterState, value: number) => {
        if (showFeedback === 'correct') return; // Prevent multiple triggers

        if (value === currentPractice) {
            // Debounce success slightly
            setTimeout(() => {
                handlePracticeSuccess(value);
            }, 500);
        }
    };

    const handlePracticeSuccess = (value: number) => {
        const timeSpent = Date.now() - startTime;
        logInteraction({
            quest_id: 3,
            scene_id: `practice_${currentPractice}`,
            number: currentPractice,
            correct_flag: true,
            time_ms: timeSpent,
            interaction_type: 'practice',
            student_response: value.toString(),
        });

        playSuccess();
        setShowFeedback('correct');
    };

    const handleNext = () => {
        if (currentQuestion < practiceNumbers.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setShowFeedback(null);
        } else {
            onComplete();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-brand-cream p-4 md:p-8 flex flex-col items-center"
        >
            <div className="w-full max-w-4xl">
                {/* Progress Header */}
                <div className="bg-gradient-to-r from-brand-teal to-brand-success rounded-2xl p-4 mb-8 shadow-xl text-white flex justify-between items-center">
                    <p className="text-xl font-bold">
                        ✨ Practice Mode
                    </p>
                    <div className="flex gap-1">
                        {practiceNumbers.map((num, idx) => (
                            <div
                                key={idx}
                                className={`w-3 h-3 rounded-full ${idx === currentQuestion ? 'bg-white scale-125' : idx < currentQuestion ? 'bg-white/50' : 'bg-white/20'}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border-4 border-brand-teal relative overflow-hidden">
                    {/* Prompt */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-deep-blue mb-2">
                            Position to <span className="text-abacus-red text-5xl">{currentPractice}</span>
                        </h2>
                        <p className="text-charcoal-gray text-lg">
                            Move the beads to show the number {currentPractice}!
                        </p>
                    </div>

                    {/* Counter */}
                    <div className="flex justify-center mb-8 scale-110 origin-center">
                        <JuniorCounter
                            key={currentQuestion} // Reset check on question change
                            targetNumber={currentPractice} // For hints if enabled
                            onStateChange={handleStateChange}
                            size="large"
                            showHints={true} // Enable hints for practice
                        />
                    </div>

                    {/* Feedback Overlay */}
                    <AnimatePresence>
                        {showFeedback === 'correct' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute inset-0 bg-white/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8"
                            >
                                <CheckCircle className="w-24 h-24 text-green-500 mb-4 animate-bounce" />
                                <h3 className="text-4xl font-bold text-green-600 mb-2">Perfect!</h3>
                                <p className="text-xl text-charcoal-gray mb-8">You found {currentPractice}!</p>

                                <Button
                                    onClick={handleNext}
                                    className="bg-green-500 hover:bg-green-600 text-white text-xl py-6 px-12 rounded-2xl shadow-xl transform transition hover:scale-105"
                                >
                                    {currentQuestion < practiceNumbers.length - 1 ? "Next Number" : "Finish Practice"}
                                    <ArrowRight className="ml-2 w-6 h-6" />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
