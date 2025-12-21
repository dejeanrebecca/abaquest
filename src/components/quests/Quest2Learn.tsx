import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { AudioNarration } from '../AudioNarration';
import { JuniorCounter } from '../JuniorCounter';
import { Sparkles } from 'lucide-react';


type Part = 'upper' | 'lower' | 'rod';

interface Quest2LearnProps {
    onComplete: () => void;
}

export function Quest2Learn({ onComplete }: Quest2LearnProps) {
    const [currentPart, setCurrentPart] = useState<Part | null>(null);
    const [completedParts, setCompletedParts] = useState<Part[]>([]);

    const parts: Array<{ part: Part; name: string; description: string; color: string }> = [
        {
            part: 'upper',
            name: 'Upper Bead (Head)',
            description: "This special bead is worth FIVE! It is like the head of your counter.",
            color: 'from-abacus-red to-red-700',
        },
        {
            part: 'lower',
            name: 'Lower Beads (Legs)',
            description: 'These four beads are each worth ONE. They are like the legs that help you count!',
            color: 'from-aqua-blue to-blue-600',
        },
        {
            part: 'rod',
            name: 'Answer Rod (Body)',
            description: 'This rod holds everything together — like the body connects the head and legs!',
            color: 'from-gray-700 to-gray-900',
        },
    ];

    const handlePartClick = (part: Part) => {
        setCurrentPart(part);
        if (!completedParts.includes(part)) {
            setCompletedParts(prev => [...prev, part]);
        }
    };

    const isComplete = completedParts.length === 3;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-warm-neutral p-8">
            <div className="flex justify-center mb-4">
                {/* Logo removed */}
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-aqua-blue to-deep-blue rounded-2xl p-4 mb-6 shadow-xl text-white">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6" />
                        <h2 className="text-center flex-1">Discovery Time: Three Special Parts!</h2>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow">
                    <AudioNarration
                        text="Your Junior Counter has three main parts, and each one has a special name and job. Tap on each part to learn about it!"
                        speaker="abby"
                        autoPlay={completedParts.length === 0}
                    />

                    <div className="my-8 flex justify-center">
                        <JuniorCounter
                            interactive={false}
                            size="large"
                            highlightPart={currentPart}
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        {parts.map(p => (
                            <button
                                key={p.part}
                                onClick={() => handlePartClick(p.part)}
                                className={`p-6 rounded-2xl border-4 transition-all ${currentPart === p.part
                                    ? 'border-sunburst-yellow bg-sunburst-yellow/10 scale-105'
                                    : completedParts.includes(p.part)
                                        ? 'border-green-400 bg-green-50'
                                        : 'border-gray-200 hover:border-aqua-blue'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${p.color} mx-auto mb-2`}></div>
                                <p className="text-deep-blue font-semibold">{p.name}</p>
                                {completedParts.includes(p.part) && <p className="text-green-600 text-sm mt-1">✓ Learned!</p>}
                            </button>
                        ))}
                    </div>

                    {currentPart && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-aqua-blue/10 to-deep-blue/10 rounded-2xl p-6 mb-6"
                        >
                            <h3 className="text-deep-blue mb-2">
                                {parts.find(p => p.part === currentPart)?.name}
                            </h3>
                            <p className="text-deep-blue/80">
                                {parts.find(p => p.part === currentPart)?.description}
                            </p>
                        </motion.div>
                    )}

                    {isComplete && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            <Button
                                onClick={onComplete}
                                className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
                                size="lg"
                            >
                                I Know the Parts! Let's Continue! ✨
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
