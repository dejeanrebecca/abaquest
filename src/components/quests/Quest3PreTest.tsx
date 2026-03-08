import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { AudioNarration } from '../AudioNarration';

interface Quest3PreTestProps {
    onComplete: () => void;
    isPostTest?: boolean;
}

export function Quest3PreTest({ onComplete, isPostTest = false }: Quest3PreTestProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'skip' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const [showIntro, setShowIntro] = useState(!isPostTest); // Add showIntro state
    // Store current options to keep them stable during re-renders until question changes
    const [currentOptions, setCurrentOptions] = useState<number[]>([]);

    const { logInteraction } = useDataLogger();

    const testQuestions = [
        { target: 0, display: 'Zero', audioKeyPre: 'q3_pretest_0', audioKeyPost: 'q3_posttest_0' },
        { target: 1, display: 'One', audioKeyPre: 'q3_pretest_1', audioKeyPost: 'q3_posttest_1' },
        { target: 5, display: 'Five', audioKeyPre: 'q3_pretest_5', audioKeyPost: 'q3_posttest_5' },
        { target: 9, display: 'Nine', audioKeyPre: 'q3_pretest_9', audioKeyPost: 'q3_posttest_9' },
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

    // Intro Screen (Only for Pre-Test)
    if (!isPostTest && showIntro) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-warm-neutral p-8">
                <div className="flex justify-center mb-4">
                    {/* Logo removed */}
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-aqua-blue">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">📋</div>
                            <h2 className="text-deep-blue mb-4">Pre-Test</h2>
                        </div>

                        <AudioNarration
                            text="Before we learn where the numbers live, let's see what you already know. Remember: You can always say 'I don't know yet' — that's how we learn!"
                            audioText="Before we learn where the numbers liv, let's see what you already know. Remember: You can always say 'I don't know yet' — that's how we learn!"
                            audioKey="q3_pretest_intro"
                            speaker="abby"
                            autoPlay
                        />

                        <Button
                            onClick={() => setShowIntro(false)}
                            className="w-full mt-8 bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl text-xl"
                            size="lg"
                        >
                            I'm Ready to Go! 🚀
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

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
                    <div className="mb-8">
                        <AudioNarration
                            key={`q3-assessment-${isPostTest ? 'post' : 'pre'}-${currentQuestion}`}
                            text={`${isPostTest
                                ? "Click the abacus that matches the number"
                                : "Give it a try! Can you find the matching number"
                                } ${currentQ.display}`}
                            audioKey={isPostTest ? currentQ.audioKeyPost : currentQ.audioKeyPre}
                            speaker="abby"
                            compact
                            autoPlay
                        />
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
                                    <InteractiveAbacus
                                        initialValue={num}
                                        interactive={false}
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

                    {/* Feedback Section - Inline */}
                    <AnimatePresence mode="wait">
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: 20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: 20 }}
                                className={`mt-8 rounded-2xl border-4 overflow-hidden ${showFeedback === 'correct' ? 'bg-green-100 border-green-500' :
                                    showFeedback === 'skip' ? 'bg-blue-100 border-blue-400' :
                                        'bg-orange-100 border-orange-400'
                                    }`}
                            >
                                <div className="p-6 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                    <div className="flex-shrink-0">
                                        {showFeedback === 'correct' ? (
                                            <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
                                        ) : showFeedback === 'skip' ? (
                                            <HelpCircle className="w-16 h-16 text-blue-600" />
                                        ) : (
                                            <XCircle className="w-16 h-16 text-orange-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className={`text-2xl font-bold mb-1 ${showFeedback === 'correct' ? 'text-green-700' :
                                            showFeedback === 'skip' ? 'text-blue-700' :
                                                'text-orange-700'
                                            }`}>
                                            {showFeedback === 'correct' ? 'Correct!' :
                                                showFeedback === 'skip' ? "Not sure? That's okay!" :
                                                    "Let's keep practicing!"}
                                        </h3>
                                        <p className="text-lg opacity-80 font-medium">
                                            {showFeedback === 'correct' ? "Great job finding the number!" :
                                                showFeedback === 'skip' ? "We'll keep learning this together." :
                                                    "Try again or keep going to learn more."}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
