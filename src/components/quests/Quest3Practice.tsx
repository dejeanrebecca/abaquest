import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioNarration } from '../AudioNarration';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { useAbacusSound } from '../../hooks/useAbacusSound';
import { Button } from '../ui/button';
import practiceImg0 from '../../assets/quest-3-img0.png';
import practiceImg1 from '../../assets/quest-3-img1.png';
import practiceImg5 from '../../assets/quest-3-img5.png';
import practiceImg9 from '../../assets/quest-3-img9.png';

interface Quest3PracticeProps {
    onComplete: () => void;
}

export function Quest3Practice({ onComplete }: Quest3PracticeProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const { logInteraction } = useDataLogger();
    const { playSuccess } = useAbacusSound();

    // Strict practice set: 0, 1, 5, 9
    const practiceNumbers = [0, 1, 5, 9];
    const currentPractice = practiceNumbers[currentQuestion];

    const getPracticeImage = (index: number) => {
        if (practiceNumbers[index] === 0) return practiceImg0;
        if (practiceNumbers[index] === 1) return practiceImg1;
        if (practiceNumbers[index] === 5) return practiceImg5;
        if (practiceNumbers[index] === 9) return practiceImg9;
        return null;
    };

    const currentImage = getPracticeImage(currentQuestion);

    useEffect(() => {
        setStartTime(Date.now());

        // Auto-succeed if the target is 0 since the abacus starts at 0
        if (currentPractice === 0 && showFeedback === null) {
            const timeoutId = setTimeout(() => {
                handlePracticeSuccess(0);
            }, 3000);

            return () => clearTimeout(timeoutId);
        }
    }, [currentQuestion, currentPractice, showFeedback]);

    const handleAbacusChange = (value: number) => {
        if (showFeedback === 'correct') return; // Prevent multiple triggers

        if (value === currentPractice) {
            // Debounce success slightly, but longer delay for initial 0 (Q0)
            const delay = currentQuestion === 0 ? 3000 : 500;

            setTimeout(() => {
                handlePracticeSuccess(value);
            }, delay);
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

    const getQuestionText = (index: number) => {
        return `Move the beads to show the number ${practiceNumbers[index]}!`;
    };

    const currentText = getQuestionText(currentQuestion);

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
                        {practiceNumbers.map((_num, idx) => (
                            <div
                                key={idx}
                                className={`w - 3 h - 3 rounded - full ${idx === currentQuestion ? 'bg-white scale-125' : idx < currentQuestion ? 'bg-white/50' : 'bg-white/20'} `}
                            />
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border-4 border-deep-blue relative overflow-hidden">
                    {/* Prompt */}
                    <div className="text-center mb-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-deep-blue mb-2">
                            Position to <span className="text-abacus-red text-5xl">{currentPractice}</span>
                        </h2>
                        <div className="max-w-2xl mx-auto flex justify-center">
                            <AudioNarration
                                key={`practice-audio-${currentPractice}`}
                                text={currentText}
                                speaker="abby"
                                compact
                                autoPlay
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-8">
                        {currentImage && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={currentQuestion} // Re-animate on change
                                className="flex-shrink-0"
                            >
                                <img
                                    src={currentImage}
                                    alt={`Practice Hint for ${currentPractice}`}
                                    className="rounded-xl shadow-md h-48 md:h-64 object-contain border-2 border-brand-teal/20"
                                />
                            </motion.div>
                        )}

                        {/* Counter */}
                        <div className="scale-110 origin-center">
                            <InteractiveAbacus
                                key={currentQuestion} // Reset on question change
                                initialValue={0}
                                onChange={handleAbacusChange}
                            />
                        </div>
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
