import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { AudioNarration } from '../AudioNarration';

interface Quest4LearnProps {
    onComplete: () => void;
}

export function Quest4Learn({ onComplete }: Quest4LearnProps) {
    const [step, setStep] = useState(0);
    const [abacusValue, setAbacusValue] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);

    // Lesson sequence for "5 + 0 = 5"
    // Step 0: "Let's start with 5."
    // Step 1: Set abacus to 5.
    // Step 2: "Now we add ZERO."
    // Step 3: "Look! The beads didn't move! It's 5!"

    const runDemo = async () => {
        setIsAutoPlaying(true);
        setStep(0);
        setAbacusValue(0);

        // Initial state
        await new Promise(r => setTimeout(r, 1000));
        setStep(1); // "Set to 5"
        setAbacusValue(5);

        await new Promise(r => setTimeout(r, 3000));
        setStep(2); // "Add Zero"
        // No change in value

        await new Promise(r => setTimeout(r, 3000));
        setStep(3); // Result
        setIsAutoPlaying(false);
    };

    useEffect(() => {
        runDemo();
    }, []);

    const renderAbbyText = () => {
        switch (step) {
            case 0: return <span>Hi! I'm Abby. Let's learn to <span className="text-brand-blue font-bold">FREEZE</span> add!</span>;
            case 1: return <span>First, I show the number <span className="text-abacus-red font-bold">5</span>. High five! (Top bead)</span>;
            case 2: return <span>Now, I add <span className="text-brand-blue font-bold">ZERO</span> beads. Watch closely...</span>;
            case 3: return (
                <span>
                    See? The beads didn't move! <span className="font-bold">5 + 0 is still 5.</span> It's <span className="text-sky-500 font-extrabold">FROZEN!</span> ❄️
                </span>
            );
            default: return null;
        }
    };

    // Helper for audio text (plain text version)
    const getAudioText = () => {
        switch (step) {
            case 0: return "Hi! I'm Abby. Let's learn to FREEZE add!";
            case 1: return "First, I show the number 5. High five! (Top bead)";
            case 2: return "Now, I add ZERO beads. Watch closely...";
            case 3: return "See? The beads didn't move! 5 + 0 is still 5. It's FROZEN!";
            default: return "";
        }
    };

    return (
        <div className="min-h-screen bg-warm-neutral p-4 flex flex-col items-center">
            {/* Abby Helper */}
            <div className="w-full max-w-4xl flex items-end gap-4 mb-4">
                <div className="w-1/4">
                    {/* Placeholder for Abby */}
                    <div className="bg-pink-100 rounded-full p-4 border-4 border-pink-300 relative inline-block">
                        <span className="text-6xl">👧</span>
                        <div className="absolute -bottom-2 right-0 bg-white px-2 py-1 rounded-full text-xs font-bold shadow">Abby</div>
                    </div>
                </div>

                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="w-3/4 bg-white p-6 rounded-3xl rounded-bl-none shadow-lg border-2 border-pink-200 relative"
                >
                    <p className="text-2xl text-gray-800 font-medium">
                        {renderAbbyText()}
                    </p>
                    <AudioNarration
                        text={getAudioText()}
                        speaker="abby"
                        autoPlay={true}
                        key={step} // Re-run effect on step change
                    />
                </motion.div>
            </div>

            {/* Learning Area */}
            <div className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center bg-white/50 rounded-3xl p-8 shadow-inner">
                <div className="bg-white p-8 rounded-3xl shadow-xl border-4 border-brand-yellow mb-8 scale-110">
                    <InteractiveAbacus
                        rods={1}
                        initialValue={abacusValue}
                        interactive={false} // Demo mode
                        key={abacusValue} // Force re-render for clean state if needed, or handle props update
                    />
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={runDemo}
                        variant="outline"
                        className="text-xl px-8 py-6 rounded-2xl border-2 border-gray-300 hover:bg-gray-100"
                        disabled={isAutoPlaying}
                    >
                        <RotateCcw className="mr-2" /> Replay
                    </Button>

                    <Button
                        onClick={onComplete}
                        className="text-xl px-12 py-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg"
                    >
                        My Turn! <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
