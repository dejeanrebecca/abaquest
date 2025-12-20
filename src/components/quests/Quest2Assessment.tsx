import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { AudioNarration } from '../AudioNarration';
import { JuniorCounter } from '../JuniorCounter';
import { DataLoggerProvider, useDataLogger } from '../DataLogger'; // Ensure import
import { HelpCircle, CheckCircle, XCircle } from 'lucide-react';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

type Part = 'upper' | 'lower' | 'rod';

interface Quest2AssessmentProps {
    type: 'pretest' | 'posttest';
    onComplete: (answers: boolean[]) => void;
}

export function Quest2Assessment({ type, onComplete }: Quest2AssessmentProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'skip' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const [answers, setAnswers] = useState<boolean[]>([]);
    const [showIntro, setShowIntro] = useState(true);

    const { logInteraction } = useDataLogger();

    const testQuestions: Array<{ part: Part; question: string }> = [
        { part: 'upper', question: 'Which part is the Upper Bead (Head)?' },
        { part: 'lower', question: 'Which part are the Lower Beads (Legs)?' },
        { part: 'rod', question: 'Which part is the Answer Rod (Body)?' },
    ];

    useEffect(() => {
        setStartTime(Date.now());
    }, [currentQuestion]);

    const handleAnswer = (answer: Part | 'skip') => {
        const currentQ = testQuestions[currentQuestion];
        const timeSpent = Date.now() - startTime;
        const isCorrect = answer === currentQ.part;

        logInteraction({
            quest_id: 2,
            scene_id: `${type}_${currentQ.part}`,
            number: null,
            correct_flag: answer === 'skip' ? null : isCorrect,
            time_ms: timeSpent,
            interaction_type: type === 'pretest' ? 'pre_test' : 'post_test',
            student_response: answer,
        });

        const newAnswers = [...answers, isCorrect];
        setAnswers(newAnswers);
        setShowFeedback(answer === 'skip' ? 'skip' : isCorrect ? 'correct' : 'wrong');

        setTimeout(() => {
            if (currentQuestion < testQuestions.length - 1) {
                setCurrentQuestion(currentQuestion + 1);
                setShowFeedback(null);
            } else {
                onComplete(newAnswers);
            }
        }, 1500);
    };

    // Intro Screen (Only for Pre-Test)
    if (type === 'pretest' && showIntro) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-warm-neutral p-8">
                <div className="flex justify-center mb-4">
                    <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-aqua-blue">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">📋</div>
                            <h2 className="text-deep-blue mb-4">Pre-Test</h2>
                        </div>

                        <AudioNarration
                            text="Before we explore the parts, let's see what you already know. Remember: You can always say 'I don't know yet' — that's how we learn!"
                            speaker="abby"
                            autoPlay
                        />

                        <Button
                            onClick={() => setShowIntro(false)}
                            className="w-full mt-8 bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
                            size="lg"
                        >
                            I'm Ready! 🚀
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    const currentQ = testQuestions[currentQuestion];
    const isPostTest = type === 'posttest';

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-warm-neutral p-8">
            <div className="flex justify-center mb-4">
                <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
            </div>

            <div className="max-w-3xl mx-auto">
                <div className={`${isPostTest ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-deep-blue'} text-white rounded-2xl p-4 mb-4 shadow-xl`}>
                    <p className="text-xl">{isPostTest ? '✅ Post-Test' : '📋 Pre-Test'}: Question {currentQuestion + 1} of {testQuestions.length}</p>
                </div>

                <div className={`bg-white rounded-2xl shadow-2xl p-8 border-4 ${isPostTest ? 'border-green-500' : 'border-aqua-blue'}`}>
                    <AudioNarration text={isPostTest ? "Let's see what you've learned!" : currentQ.question} speaker="abby" compact />

                    <div className="my-8 flex justify-center">
                        <JuniorCounter interactive={false} size="large" />
                    </div>

                    <p className="text-center text-xl text-deep-blue mb-6">{currentQ.question}</p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Button
                            onClick={() => handleAnswer('upper')}
                            className="bg-abacus-red hover:bg-abacus-red/90 text-white py-8 rounded-2xl shadow-lg"
                        >
                            Upper Bead
                        </Button>
                        <Button
                            onClick={() => handleAnswer('lower')}
                            className="bg-aqua-blue hover:bg-aqua-blue/90 text-white py-8 rounded-2xl shadow-lg"
                        >
                            Lower Beads
                        </Button>
                        <Button
                            onClick={() => handleAnswer('rod')}
                            className="bg-gray-700 hover:bg-gray-800 text-white py-8 rounded-2xl shadow-lg"
                        >
                            Answer Rod
                        </Button>
                    </div>

                    {!isPostTest && (
                        <Button
                            onClick={() => handleAnswer('skip')}
                            variant="outline"
                            className="w-full border-2 border-deep-blue/30 text-deep-blue hover:bg-deep-blue/5 py-4 rounded-xl"
                        >
                            <HelpCircle className="w-5 h-5 mr-2" />
                            I don't know yet
                        </Button>
                    )}

                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div
                                initial={{ scale: 0, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0, y: 20 }}
                                className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 ${showFeedback === 'correct'
                                        ? 'bg-green-100 border-3 border-green-500'
                                        : showFeedback === 'skip'
                                            ? 'bg-blue-100 border-3 border-blue-400'
                                            : 'bg-orange-100 border-3 border-orange-400'
                                    }`}
                            >
                                {showFeedback === 'correct' ? (
                                    <>
                                        <CheckCircle className="w-8 h-8 text-green-600" />
                                        <span className="text-xl text-green-700">Great! 🎉</span>
                                    </>
                                ) : showFeedback === 'skip' ? (
                                    <>
                                        <HelpCircle className="w-8 h-8 text-blue-600" />
                                        <span className="text-xl text-blue-700">That's okay! Let's learn together! 📚</span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-8 h-8 text-orange-600" />
                                        <span className="text-xl text-orange-700">Keep trying! 💪</span>
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
