import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { useAbacusSound } from '../../hooks/useAbacusSound';
import { AudioNarration } from '../AudioNarration';

interface Quest4PracticeProps {
    onComplete: () => void;
}

export function Quest4Practice({ onComplete }: Quest4PracticeProps) {
    const [currentProblem, setCurrentProblem] = useState(0);
    const [isCorrect, setIsCorrect] = useState(false);
    const { playSuccess, playError } = useAbacusSound();

    const problems = [
        {
            id: 1,
            start: 0,
            add: 3,
            target: 3,
            prompt: "Start at 0. Add 3 beads.",
            audioKey: "q4_practice_add_3",
            hint: "Count 1, 2, 3 lower beads!"
        },
        {
            id: 2,
            start: 0,
            add: 2,
            target: 2,
            prompt: "Start at 0. Add 2 more beads.",
            audioKey: "q4_practice_add_2",
            hint: "Push up 2 more lower beads!"
        },
        {
            id: 3,
            start: 0,
            add: 4,
            target: 4,
            prompt: "Start at 0. Add 4. (0 + 4)",
            audioKey: "q4_practice_add_4",
            hint: "Push up 4 lower beads!"
        }
    ];

    const problem = problems[currentProblem];

    // We need to manage the abacus state slightly differently.
    // Standard InteractiveAbacus maintains internal state.
    // We can force it to a starting value by keying it or passing prop if it supports control.
    // The current InteractiveAbacus implementation takes `initialValue` but manages state internally.
    // To reset it for each problem, we'll use a key.

    // Special handling for the "Add Zero" case.
    // If target is same as start, user might just stare at it.
    // We need a button to confirm "I'm done" or detect non-action?
    // Actually, for "Add Zero", if they don't move anything, the value IS the target immediately.
    // So it might trigger immediately?
    // Let's modify handleAbacusChange to debounce or check user intent?
    // Or better: For "Freeze" problems, we might need a "Check Answer" button, 
    // OR just delay the success if value matches immediately (which it does).

    // Implementation strategy:
    // If problem.start === problem.target, we auto-trigger success after a delay?
    // No, that's confusing. They need to realize they shouldn't move it.
    // PROMPT: "Set to 4..." (User sets 4) -> "Now Add 0" -> (User waits) -> Success?
    // Simpler: The problem starts WITH the `start` value pre-set?
    // InteractiveAbacus takes `initialValue`.

    // Let's render the `InteractiveAbacus` with `initialValue={problem.start}`.
    // If `start === target`, it will trigger `onChange` with the correct value immediately on mount?
    // No, `onChange` usually triggers on interaction. 
    // If start == target (Freeze), they might click active beads (mistake) or do nothing.
    // We can add a "Check" button for all, or just let it auto-detect.
    // For Freeze, let's use a "Done / Freeze!" button to confirm "I didn't move anything".

    const handleNext = () => {
        if (currentProblem < problems.length - 1) {
            setCurrentProblem(prev => prev + 1);
            setIsCorrect(false);
        } else {
            onComplete();
        }
    };

    // Track current value from Abacus
    const [currentAbacusVal, setCurrentAbacusVal] = useState(problem.start);

    return (
        <div className="min-h-screen bg-sky-50 p-4 flex flex-col items-center">
            {/* Progress */}
            <div className="w-full max-w-2xl flex justify-between items-center mb-8">
                <div className="flex gap-2">
                    {problems.map((p, i) => (
                        <div
                            key={p.id}
                            className={`w-3 h-3 rounded-full ${i <= currentProblem ? 'bg-sky-500' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>
                <div className="bg-white px-4 py-2 rounded-full shadow text-sky-800 font-bold">
                    Problem {currentProblem + 1} / {problems.length}
                </div>
            </div>

            {/* Question Card */}
            <motion.div
                key={problem.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white p-8 rounded-3xl shadow-xl text-center mb-8 max-w-2xl w-full border-b-4 border-sky-200"
            >
                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    {problem.prompt}
                </h2>
                <div className="bg-sky-100 inline-block px-6 py-2 rounded-xl text-sky-800 font-mono text-xl">
                    {problem.start} + {problem.add} = ?
                </div>
                <AudioNarration text={problem.prompt} audioKey={problem.audioKey} speaker="narrator" autoPlay />
            </motion.div>

            {/* Interaction Area */}
            <div className="bg-white/80 p-8 rounded-3xl shadow-inline">
                <InteractiveAbacus
                    key={problem.id} // Re-mount on new problem to reset state
                    initialValue={problem.start}
                    rods={1}
                    onChange={(val) => {
                        setCurrentAbacusVal(val);
                        if (val === problem.target && problem.add !== 0) { // Auto-advance for non-zero additions
                            setIsCorrect(true);
                            playSuccess();
                        }
                    }}
                />
            </div>

            {/* Controls */}
            <div className="mt-8 h-24 flex items-center justify-center">
                <AnimatePresence mode='wait'>
                    {isCorrect ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="flex flex-col items-center"
                        >
                            <div className="text-green-500 flex items-center gap-2 text-2xl font-bold mb-4">
                                <CheckCircle size={32} /> Correct!
                            </div>
                            <Button onClick={handleNext} className="bg-green-500 hover:bg-green-600 text-white text-xl px-12 py-4 rounded-xl shadow-lg">
                                Next <ArrowRight className="ml-2" />
                            </Button>
                        </motion.div>
                    ) : (
                        <div className="flex gap-4">
                            {problem.add === 0 ? (
                                <Button
                                    onClick={() => {
                                        if (currentAbacusVal === problem.target) {
                                            setIsCorrect(true);
                                            playSuccess();
                                        } else {
                                            playError();
                                        }
                                    }}
                                    className="bg-sky-500 hover:bg-sky-600 text-white text-xl px-8 py-4 rounded-xl shadow-lg"
                                >
                                    ❄️ Freeze! (Check)
                                </Button>
                            ) : (
                                <div className="text-gray-400 italic">Set the correct number...</div>
                            )}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
