import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AudioNarration } from '../AudioNarration';
import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { useAbacusSound } from '../../hooks/useAbacusSound';

interface Quest4PreTestProps {
    onComplete: (score: number) => void;
    isPreTest?: boolean;
}

const questions = [
    {
        id: 1,
        problem: "0 + 3",
        answer: 3,
        distractors: [0, 30]
    },
    {
        id: 2,
        problem: "0 + 2",
        answer: 2,
        distractors: [0, 4]
    },
    {
        id: 3,
        problem: "0 + 4",
        answer: 4,
        distractors: [0, 5]
    },
    {
        id: 4,
        problem: "0 + 5",
        answer: 5,
        distractors: [0, 50]
    }
];

export function Quest4PreTest({ onComplete, isPreTest = true }: Quest4PreTestProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'skip' | null>(null);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const { playSuccess, playError } = useAbacusSound();

    const handleAnswer = (selected: number | null) => {
        if (showFeedback !== null) return;

        if (selected === null) {
            // Skipped / I don't know yet
            setIsCorrect(false);
            setShowFeedback('skip');
        } else {
            const correct = selected === questions[currentQuestion].answer;
            setIsCorrect(correct);
            if (correct) {
                setScore(s => s + 1);
                playSuccess();
            } else {
                playError();
            }
            setShowFeedback(correct ? 'correct' : 'wrong');
        }

        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(q => q + 1);
                setShowFeedback(null);
            } else {
                // Pre-test finished, show transition screen instead of auto-completing
                setIsCompleted(true);
            }
        }, 1500);
    };

    const question = questions[currentQuestion];
    // Shuffle options: Answer + Distractors, stable across re-renders for the same question
    const options = useMemo(() => {
        const question = questions[currentQuestion];
        const rawOptions = [question.answer, ...question.distractors];
        return rawOptions.sort(() => Math.random() - 0.5);
    }, [currentQuestion]);

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-warm-neutral p-4 flex flex-col items-center justify-center">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl p-12 text-center border-4 border-brand-blue">
                    <h2 className="text-4xl font-bold text-brand-blue mb-6">
                        {isPreTest ? "Great Start!" : "Quest Complete!"}
                    </h2>
                    <div className="text-8xl mb-8">❄️</div>
                    <p className="text-xl text-gray-600 mb-8">
                        {isPreTest
                            ? "Now you've seen the questions... are you ready to master these new secrets?"
                            : `You got ${score} out of ${questions.length} correct!`}
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onComplete(score)}
                        className="bg-abacus-red text-white text-2xl font-bold py-6 px-12 rounded-2xl shadow-lg hover:bg-red-600 transition-colors"
                    >
                        {isPreTest ? "Let's Learn!" : "Finish"}
                    </motion.button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-warm-neutral p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-8 border-4 border-brand-blue">
                <div className="flex justify-between items-center mb-8 border-b-2 border-gray-100 pb-4">
                    <h2 className="text-3xl font-bold text-brand-text">
                        {isPreTest ? "Quick Check" : "Final Challenge"}
                    </h2>
                    <div className="text-xl text-gray-500 font-medium">
                        Question {currentQuestion + 1} of {questions.length}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12 items-center justify-center mb-12">
                    <div className="text-6xl font-bold text-brand-blue font-mono bg-blue-50 px-8 py-4 rounded-2xl border-2 border-blue-200 flex flex-col items-center">
                        <div>{question.problem} = ?</div>
                        <div className="mt-4 text-xl font-sans font-normal">
                            <AudioNarration
                                key={`q4-quickcheck-${currentQuestion}`}
                                text={`What is ${question.problem.replace('+', 'plus')}?`}
                                speaker="abby"
                                compact
                                autoPlay
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {options.map((opt) => (
                        <motion.button
                            key={opt}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAnswer(opt)}
                            disabled={showFeedback !== null}
                            className={`
                p-6 rounded-2xl border-4 transition-all
                flex flex-col items-center gap-4
                ${showFeedback !== null && opt === question.answer ? 'bg-green-100 border-green-500' : ''}
                ${showFeedback !== null && opt !== question.answer && !isCorrect ? 'opacity-50' : ''}
                ${showFeedback === null ? 'bg-white border-gray-200 hover:border-brand-blue hover:shadow-lg' : ''}
              `}
                        >
                            {/* Using JuniorCounter as a visual for the option could be cool, but maybe too busy? 
                  Let's just use big numbers for this specific math check, 
                  as "Adding Zero" is abstract.
                  Actually, showing the beads is helpful.
              */}
                            <div className="pointer-events-none scale-75 -my-4">
                                {/* Non-interactive display */}
                                <InteractiveAbacus initialValue={opt} interactive={false} />
                            </div>
                            <span className="text-3xl font-bold text-gray-800">{opt}</span>
                        </motion.button>
                    ))}
                </div>

                {isPreTest && (
                    <div className="mt-8 flex justify-center">
                        <Button
                            onClick={() => handleAnswer(null)}
                            variant="outline"
                            className="w-full max-w-md border-2 border-brand-blue/30 text-brand-blue hover:bg-brand-blue/5 py-6 rounded-2xl text-lg font-medium transition-colors"
                        >
                            <HelpCircle className="w-6 h-6 mr-2" />
                            I don't know yet
                        </Button>
                    </div>
                )}

                <div className="h-16 mt-8 flex justify-center items-center">
                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`text-2xl font-bold flex items-center gap-2 ${showFeedback === 'correct' ? 'text-green-600' : showFeedback === 'skip' ? 'text-blue-500' : 'text-orange-500'}`}
                            >
                                {showFeedback === 'correct' ? <><CheckCircle /> Great Job!</> : showFeedback === 'skip' ? <><HelpCircle /> That's okay, let's learn together!</> : <><XCircle /> Incorrect!</>}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* End Button Text Logic handled in parent orchestrator? 
          Wait, the requirement was "End button text: Let's Learn".
          This usually applies to the Transition Screen *after* the pre-test, 
          OR the button *on* the pre-test results screen?
          
          In `Quest4Freeze.tsx`, I handle `onComplete`.
          If this component handles the quiz logic internally and just calls onComplete...
          
          Ah, I see `Quest3PreTest` usually doesn't have a "results screen" inside it, it just finishes.
          The *Transition Screen* in `Quest4Freeze` (orchestrator) is what shows "Start Pre-Test".
          
          Maybe the requirement meant the button *To Start* the lesson (i.e. AFTER pre-test)?
          "at the end of the pre-test- the button should say: 'let’s learn' or something."
          
          This implies the success state of the pretest should show a button "Let's Learn".
          
          Currently `Quest4PreTest` auto-calls `onComplete`.
          I should modify it to show a "Complete" state with that button if `isPreTest` is true.
      */}
        </div>
    );
}
