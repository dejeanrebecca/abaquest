import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import { JuniorCounter } from '../JuniorCounter';

interface Quest3PreTestProps {
    onComplete: () => void;
    isPostTest?: boolean;
}

export function Quest3PreTest({ onComplete, isPostTest = false }: Quest3PreTestProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'skip' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    // Store current options to keep them stable during re-renders until question changes
    const [currentOptions, setCurrentOptions] = useState<number[]>([]);

    const { logInteraction } = useDataLogger();

    const testQuestions = [
        { target: 0, display: 'Zero' },
        { target: 1, display: 'One' },
        { target: 5, display: 'Five' },
        { target: 9, display: 'Nine' },
    ];

    const fullOptions = [0, 1, 5, 9];

    // Helper to get 3 options: Target + 2 Random Distractors
    const getThreeOptions = (target: number) => {
        const distractors = fullOptions.filter(n => n !== target);
        // Shuffle distractors
        const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random());
        // Pick top 2
        const selectedDistractors = shuffledDistractors.slice(0, 2);
        // Combine and shuffle again
        return [...selectedDistractors, target].sort(() => 0.5 - Math.random());
    };

    useEffect(() => {
        setStartTime(Date.now());
        // Set new options when question changes
        setCurrentOptions(getThreeOptions(testQuestions[currentQuestion].target));
    }, [currentQuestion]);

    const handleAnswer = (selectedNumber: number, isSkip: boolean = false) => {
        if (showFeedback) return;

        const currentQ = testQuestions[currentQuestion];
        const isCorrect = !isSkip && selectedNumber === currentQ.target;
        const timeSpent = Date.now() - startTime;

        logInteraction({
            quest_id: 3,
            scene_id: `${isPostTest ? 'posttest' : 'pretest'}_question_${currentQuestion + 1}`,
            number: currentQ.target,
            correct_flag: isSkip ? null : isCorrect,
            time_ms: timeSpent,
            interaction_type: isPostTest ? 'post_test' : 'pre_test',
            student_response: isSkip ? 'I_dont_know_yet' : selectedNumber.toString(),
        });

        setShowFeedback(isSkip ? 'skip' : (isCorrect ? 'correct' : 'wrong'));

        setTimeout(() => {
            if (currentQuestion < testQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setShowFeedback(null);
            } else {
                onComplete();
            }
        }, 1500);
    };

    const currentQ = testQuestions[currentQuestion];

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            className="min-h-screen bg-warm-neutral p-4 md:p-8 flex flex-col items-center"
        >
            <div className="w-full max-w-5xl">
                {/* Header */}
                <div className="bg-deep-blue text-white rounded-2xl p-6 mb-8 shadow-xl flex justify-between items-center">
                    <div>
                        <p className="text-sm opacity-80 mb-1 uppercase tracking-wider font-bold">
                            {isPostTest ? '📝 Post-Test' : '📋 Pre-Test'}
                        </p>
                        <h2 className="text-3xl font-bold">
                            Find: <span className="text-sunburst-yellow ml-2">{currentQ.display}</span>
                        </h2>
                    </div>
                    <div className="text-right bg-white/10 px-4 py-2 rounded-xl">
                        <p className="text-sm font-medium">Question {currentQuestion + 1} / {testQuestions.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] shadow-2xl p-8 border-4 border-aqua-blue max-w-4xl mx-auto">
                    <div className="flex items-center gap-4 mb-8 bg-aqua-blue/10 rounded-2xl p-4 border border-aqua-blue/20">
                        <div className="text-4xl">🐝</div>
                        <p className="text-deep-blue text-lg font-medium">
                            {isPostTest
                                ? "Click the abacus that matches the number!"
                                : "Give it a try! Can you find the matching number?"}
                        </p>
                    </div>

                    {/* Options Grid - Now only displaying 3 options */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {currentOptions.map((num) => (
                            <motion.button
                                key={num}
                                onClick={() => handleAnswer(num)}
                                whileHover={{ scale: 1.05, borderColor: '#FFC107' }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-gray-50 rounded-2xl p-4 border-4 border-gray-100 hover:shadow-lg transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="pointer-events-none transform group-hover:scale-110 transition-transform duration-300">
                                    <JuniorCounter
                                        value={num}
                                        interactive={false}
                                        size="small"
                                        showValue={false}
                                    />
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    {!isPostTest && (
                        <Button
                            onClick={() => handleAnswer(0, true)}
                            variant="outline"
                            className="w-full border-2 border-deep-blue/30 text-deep-blue hover:bg-deep-blue/5 py-4 rounded-xl text-lg font-medium transition-colors"
                        >
                            <HelpCircle className="w-6 h-6 mr-2" />
                            I don't know yet
                        </Button>
                    )}

                    {/* Feedback Overlay */}
                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`absolute inset-0 m-4 rounded-[1.5rem] flex items-center justify-center backdrop-blur-sm z-10 ${showFeedback === 'correct' ? 'bg-green-100/95 border-4 border-green-500' :
                                        showFeedback === 'skip' ? 'bg-blue-100/95 border-4 border-blue-400' :
                                            'bg-orange-100/95 border-4 border-orange-400'
                                    }`}
                            >
                                <div className="text-center p-6">
                                    {showFeedback === 'correct' ? (
                                        <>
                                            <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4 animate-bounce" />
                                            <h3 className="text-3xl font-bold text-green-700">Correct!</h3>
                                        </>
                                    ) : showFeedback === 'skip' ? (
                                        <>
                                            <HelpCircle className="w-20 h-20 text-blue-600 mx-auto mb-4" />
                                            <h3 className="text-2xl font-bold text-blue-700">Not sure? That's okay!</h3>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-20 h-20 text-orange-600 mx-auto mb-4" />
                                            <h3 className="text-2xl font-bold text-orange-700">Let's keep practicing!</h3>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
