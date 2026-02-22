import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { JuniorCounter } from '../JuniorCounter';
import { useAbacusSound } from '../../hooks/useAbacusSound';

interface Quest4PreTestProps {
    onComplete: (score: number) => void;
    isPreTest?: boolean;
}

export function Quest4PreTest({ onComplete, isPreTest = true }: Quest4PreTestProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const { playSuccess, playError } = useAbacusSound();

    const questions = [
        {
            id: 1,
            problem: "3 + 0",
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

    const handleAnswer = (selected: number) => {
        if (showFeedback) return;

        const correct = selected === questions[currentQuestion].answer;
        setIsCorrect(correct);
        if (correct) {
            setScore(s => s + 1);
            playSuccess();
        } else {
            playError();
        }
        setShowFeedback(true);

        // Auto advancing or showing complete
        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(q => q + 1);
                setShowFeedback(false);
            } else {
                // Pre-test finished, show transition screen instead of auto-completing
                setIsCompleted(true);
            }
        }, 1500);
    };

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
                            ? "Now you've seen the questions... are you ready to master the Ice Valley secrets?"
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

    const question = questions[currentQuestion];
    // Shuffle options: Answer + Distractors
    // For consistency in rendering, we'll just sort them or use a fixed order if shuffling causes hydration issues.
    // Simple sort for now.
    const options = [question.answer, ...question.distractors].sort((a, b) => a - b);

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
                    <div className="text-6xl font-bold text-brand-blue font-mono bg-blue-50 px-8 py-4 rounded-2xl border-2 border-blue-200">
                        {question.problem} = ?
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {options.map((opt) => (
                        <motion.button
                            key={opt}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAnswer(opt)}
                            disabled={showFeedback}
                            className={`
                p-6 rounded-2xl border-4 transition-all
                flex flex-col items-center gap-4
                ${showFeedback && opt === question.answer ? 'bg-green-100 border-green-500' : ''}
                ${showFeedback && opt !== question.answer && !isCorrect ? 'opacity-50' : ''}
                ${!showFeedback ? 'bg-white border-gray-200 hover:border-brand-blue hover:shadow-lg' : ''}
              `}
                        >
                            {/* Using JuniorCounter as a visual for the option could be cool, but maybe too busy? 
                  Let's just use big numbers for this specific math check, 
                  as "Adding Zero" is abstract.
                  Actually, showing the beads is helpful.
              */}
                            <div className="pointer-events-none scale-75 -my-4">
                                {/* Non-interactive display */}
                                <JuniorCounter value={opt} interactive={false} />
                            </div>
                            <span className="text-3xl font-bold text-gray-800">{opt}</span>
                        </motion.button>
                    ))}
                </div>

                <div className="h-16 mt-8 flex justify-center items-center">
                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`text-2xl font-bold flex items-center gap-2 ${isCorrect ? 'text-green-600' : 'text-orange-500'}`}
                            >
                                {isCorrect ? <><CheckCircle /> Great Job!</> : <><XCircle /> Incorrect!</>}
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
