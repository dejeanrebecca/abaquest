import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { ArrowRight, RotateCcw, Play } from 'lucide-react';
import { JuniorCounter } from '../JuniorCounter';

interface Quest3LearnProps {
    onComplete: () => void;
}

const DEMO_STEPS = [
    {
        number: 0,
        title: "The Number Zero",
        description: "Zero means no beads are touching the white bar. It's empty!",
        audioCheck: "Can you see zero?"
    },
    {
        number: 1,
        title: "The Number One",
        description: "For one, we push ONE lower bead up to the bar.",
        audioCheck: "Beep! That's one!"
    },
    {
        number: 5,
        title: "The Number Five",
        description: "Five is special! We bring the huge upper bead DOWN to the bar.",
        audioCheck: "Whoosh! High five!"
    },
    {
        number: 9,
        title: "The Number Nine",
        description: "Nine is everything! Top bead down, all lower beads up. It's a party!",
        audioCheck: "Full house!"
    }
];

export function Quest3Learn({ onComplete }: Quest3LearnProps) {
    const [stepIndex, setStepIndex] = useState(0);
    const [currentValue, setCurrentValue] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const currentStep = DEMO_STEPS[stepIndex];
    const isLastStep = stepIndex === DEMO_STEPS.length - 1;

    const playDemo = async () => {
        setIsAnimating(true);
        // Reset to 0 first for clear demonstration
        setCurrentValue(0);

        // Small delay before showing the target number to allow reset visibility
        if (currentStep.number !== 0) {
            await new Promise(resolve => setTimeout(resolve, 800));
            setCurrentValue(currentStep.number);
        }
        setIsAnimating(false);
    };

    useEffect(() => {
        playDemo();
    }, [stepIndex]);

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setStepIndex(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (stepIndex > 0) {
            setStepIndex(prev => prev - 1);
        }
    };

    return (
        <div className="min-h-screen bg-warm-neutral p-4 md:p-8 flex flex-col items-center">
            {/* Header / Abby Area */}
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl p-6 border-4 border-sunburst-yellow mb-8 flex items-center gap-6 relative overflow-hidden">
                <div className="text-6xl animate-bounce-slight">🐝</div>
                <div className="z-10">
                    <h2 className="text-3xl font-bold text-deep-blue mb-2">{currentStep.title}</h2>
                    <p className="text-xl text-charcoal-gray">{currentStep.description}</p>
                </div>
                {/* Decorative blob */}
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-sunburst-yellow/20 rounded-full blur-3xl"></div>
            </div>

            {/* Main Stage */}
            <div className="flex flex-col md:flex-row gap-12 items-center justify-center w-full max-w-5xl flex-1">

                {/* Large Counter Display */}
                <div className="relative p-10 bg-white rounded-[3rem] shadow-2xl border-4 border-aqua-blue">
                    <div className="scale-125 origin-center">
                        <JuniorCounter
                            value={currentValue}
                            interactive={false}
                            size="large"
                            showValue={true}
                        />
                    </div>

                    {/* Replay Button overlay */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={playDemo}
                        disabled={isAnimating}
                        className="absolute bottom-4 right-4 bg-deep-blue/10 p-3 rounded-full text-deep-blue hover:bg-deep-blue/20 transition-colors"
                        title="Replay Animation"
                    >
                        <RotateCcw className={`w-6 h-6 ${isAnimating ? 'animate-spin' : ''}`} />
                    </motion.button>
                </div>

                {/* Controls Area */}
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg text-center mb-4">
                        <p className="text-deep-blue font-medium mb-2">Step {stepIndex + 1} of {DEMO_STEPS.length}</p>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-aqua-blue h-3 rounded-full transition-all duration-500"
                                style={{ width: `${((stepIndex + 1) / DEMO_STEPS.length) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        {stepIndex > 0 && (
                            <Button
                                onClick={handleBack}
                                variant="outline"
                                className="flex-1 py-6 text-lg border-2 border-charcoal-gray text-charcoal-gray"
                            >
                                Back
                            </Button>
                        )}
                        <Button
                            onClick={handleNext}
                            className={`flex-1 py-6 text-xl shadow-xl transform transition-all ${isLastStep ? 'bg-abacus-red hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {isLastStep ? "Start Practice!" : "Next Number"}
                            <ArrowRight className="ml-2 w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
