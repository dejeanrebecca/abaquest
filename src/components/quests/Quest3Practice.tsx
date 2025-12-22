import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { useAbacusSound } from '../../hooks/useAbacusSound';




interface Quest3PracticeProps {
    onComplete: () => void;
}

export function Quest3Practice({ onComplete }: Quest3PracticeProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const { logInteraction } = useDataLogger();
    const { playSuccess } = useAbacusSound();


    const practiceNumbers = [1, 5];
    const currentPractice = practiceNumbers[currentQuestion];


    useEffect(() => {
        setStartTime(Date.now());
    }, [currentQuestion]);


    const handleAbacusChange = (value: number) => {
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

        setTimeout(() => {

            if (currentQuestion < practiceNumbers.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setShowFeedback(null);
            } else {
                onComplete();
            }
        }, 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-brand-cream p-8"
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-brand-teal to-brand-success rounded-2xl p-4 mb-4 shadow-xl text-white">
                    <div className="flex justify-between items-center">
                        <p className="text-xl">
                            ✨ Practice: Build the number <span className="text-3xl ml-2 font-bold">{currentPractice}</span>
                        </p>
                        <p className="text-sm">
                            {currentQuestion + 1} of {practiceNumbers.length}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-brand-teal">
                    <div className="flex items-center gap-2 mb-6 bg-brand-teal/10 rounded-xl p-3">
                        <div className="text-2xl">🐝</div>
                        <p className="text-brand-text">
                            {currentPractice === 1
                                ? "Remember: One uses a lower bead. Slide it up!"
                                : "Remember: Five uses the special top bead! Slide it down!"}
                        </p>
                    </div>

                    <div className="flex justify-center mb-8">
                        <InteractiveAbacus
                            key={currentQuestion}
                            rods={1}
                            onChange={handleAbacusChange}
                        />
                    </div>

                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div
                                initial={{ scale: 0, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0, y: 20 }}
                                className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 ${showFeedback === 'correct'
                                    ? 'bg-green-100 border-3 border-green-500'
                                    : 'bg-orange-100 border-3 border-orange-400'
                                    }`}
                            >
                                {showFeedback === 'correct' ? (
                                    <>
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                        <span className="text-xl text-green-700">Perfect! You're getting it! 🌟</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-8 h-8 text-orange-600" />
                                        <span className="text-xl text-orange-700">Almost! Try again next time! 💪</span>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}

