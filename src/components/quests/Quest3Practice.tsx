import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useDataLogger } from '../DataLogger';


interface Quest3PracticeProps {
    onComplete: () => void;
}

export function Quest3Practice({ onComplete }: Quest3PracticeProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const { logInteraction } = useDataLogger();

    const practiceNumbers = [1, 5];

    useEffect(() => {
        setStartTime(Date.now());
    }, [currentQuestion]);


    const handlePracticeAnswer = (answer: string) => {
        const currentPractice = practiceNumbers[currentQuestion];
        const correctPosition =
            currentPractice === 1 ? 'middle-lower' : 'middle-upper';
        const isCorrect = answer === correctPosition;
        const timeSpent = Date.now() - startTime;

        logInteraction({
            quest_id: 3,
            scene_id: `practice_${currentPractice}`,
            number: currentPractice,
            correct_flag: isCorrect,
            time_ms: timeSpent,
            interaction_type: 'practice',
            student_response: answer,
        });

        setShowFeedback(isCorrect ? 'correct' : 'wrong');

        setTimeout(() => {
            if (currentQuestion < practiceNumbers.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setShowFeedback(null);
            } else {
                onComplete();
            }
        }, 1500);
    };

    const renderAbacusPosition = (position: string, isHighlighted: boolean = false) => {
        return (
            <div className="flex flex-col items-center gap-1">
                <div
                    className={`w-10 h-10 rounded-full transition-all shadow-lg ${position === 'top' && isHighlighted
                        ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
                        : position === 'top'
                            ? 'bg-sunburst-yellow'
                            : 'bg-gray-300'
                        }`}
                ></div>
                <div className="w-1 h-6 bg-gray-700 rounded"></div>
                <div className="flex flex-col gap-1">
                    {[0, 1].map((i) => (
                        <div
                            key={`upper-${i}`}
                            className={`w-8 h-8 rounded-full transition-all shadow-lg ${position === 'middle-upper' && isHighlighted
                                ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
                                : position === 'middle-upper'
                                    ? 'bg-sunburst-yellow'
                                    : 'bg-gray-400'
                                }`}
                        ></div>
                    ))}
                </div>
                <div className="w-1 h-4 bg-gray-700 rounded"></div>
                <div className="flex flex-col gap-1">
                    {[0, 1].map((i) => (
                        <div
                            key={`lower-${i}`}
                            className={`w-8 h-8 rounded-full transition-all shadow-lg ${position === 'middle-lower' && isHighlighted
                                ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
                                : position === 'middle-lower'
                                    ? 'bg-sunburst-yellow'
                                    : 'bg-gray-400'
                                }`}
                        ></div>
                    ))}
                </div>
                <div className="w-1 h-6 bg-gray-700 rounded"></div>
                <div
                    className={`w-10 h-10 rounded-full transition-all shadow-lg ${position === 'bottom' && isHighlighted
                        ? 'bg-abacus-red ring-4 ring-aqua-blue scale-110'
                        : position === 'bottom'
                            ? 'bg-abacus-red'
                            : 'bg-gray-300'
                        }`}
                ></div>
            </div>
        );
    };

    const currentPractice = practiceNumbers[currentQuestion];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-warm-neutral p-8"
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-4 shadow-xl text-white">
                    <div className="flex justify-between items-center">
                        <p className="text-xl">
                            ✨ Practice: Build the number <span className="text-3xl ml-2">{currentPractice}</span>
                        </p>
                        <p className="text-sm">
                            {currentQuestion + 1} of {practiceNumbers.length}
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-500">
                    <div className="flex items-center gap-2 mb-6 bg-green-50 rounded-xl p-3">
                        <div className="text-2xl">🐝</div>
                        <p className="text-deep-blue">
                            {currentPractice === 1
                                ? "Remember: One uses a lower bead. Which counter shows this?"
                                : "Remember: Five uses the special top bead! Which one is it?"}
                        </p>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {['top', 'middle-upper', 'middle-lower', 'bottom'].map((position) => (
                            <motion.button
                                key={position}
                                onClick={() => handlePracticeAnswer(position)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gray-50 rounded-xl p-4 border-3 border-gray-200 hover:border-green-500 transition-all shadow-md"
                            >
                                {renderAbacusPosition(position)}
                            </motion.button>
                        ))}
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
