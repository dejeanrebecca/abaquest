import { useState } from 'react';
import { motion } from 'motion/react';
import { useAbacusSound } from '../hooks/useAbacusSound';



interface InteractiveAbacusProps {
    initialValue?: number;
    rods?: number;
    onChange?: (value: number) => void;
    interactive?: boolean;
}

export function InteractiveAbacus({
    initialValue = 0,
    rods = 1, // Default to single rod for simple number concepts first
    onChange,
    interactive = true
}: InteractiveAbacusProps) {
    // State to track values per column (e.g. [hundreds, tens, ones])
    // For now, simpler implementation: just tracking a single value if rods=1
    const [currentValue, setCurrentValue] = useState(initialValue);
    const { playClick } = useAbacusSound();


    // Helper to extract digits for multiple rods
    const getDigit = (val: number, rodIndex: number) => {
        const str = val.toString();
        const digit = str[str.length - 1 - rodIndex];
        return digit ? parseInt(digit) : 0;
    };

    const updateValue = (rodIndex: number, delta: number) => {
        if (!interactive) return;

        setCurrentValue(prev => {
            // Calculate new value based on rod position
            // rodIndex 0 = ones place, 1 = tens place
            const placeMultiplier = Math.pow(10, rodIndex);
            const newTotal = prev + (delta * placeMultiplier);

            // Prevent negative or impossible values (simple safety)
            if (newTotal < 0) return prev;

            if (newTotal !== prev) {
                playClick();
            }

            onChange?.(newTotal);
            return newTotal;
        });
    };


    return (
        <div className="flex justify-center items-center py-8">
            <div className="bg-brand-purple p-4 rounded-xl shadow-2xl relative">
                {/* Frame Border */}
                <div className="flex gap-4 bg-brand-cream/10 p-4 rounded-lg border-4 border-brand-yellow/50">
                    {Array.from({ length: rods }).map((_, i) => (
                        <AbacusRod
                            key={i}
                            value={getDigit(currentValue, i)}
                            onUpdate={(delta) => updateValue(i, delta)}
                            interactive={interactive}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

interface RodProps {
    value: number;
    onUpdate: (delta: number) => void;
    interactive: boolean;
}

function AbacusRod({ value, onUpdate, interactive }: RodProps) {

    // Value decomposition
    // 5-bead (Heaven) active if value >= 5
    // 1-beads (Earth) count = value % 5

    const isHeavenActive = value >= 5;
    const earthCount = value % 5;

    return (
        <div className="flex flex-col items-center w-16 h-[280px] -mt-[5px] relative bg-transparent">
            {/* The Rod Line */}
            <div className="absolute inset-y-0 w-4 bg-gray-400 rounded-full z-0" />

            {/* Heaven Deck (Top) */}
            <div className="h-24 w-full flex flex-col justify-end items-center z-10 pb-2">
                <Bead
                    isActive={isHeavenActive}
                    type="heaven"
                    onToggle={() => onUpdate(isHeavenActive ? -5 : 5)}
                    interactive={interactive}
                />
            </div>

            {/* Divider Bar - Matching Junior Counter Style */}
            <div className="w-24 h-4 bg-gray-400 rounded-full shadow-md z-10 mt-2 mb-0" />

            {/* Earth Deck (Bottom) */}
            <div className="h-40 w-full flex flex-col justify-start items-center z-10 pt-2 gap-1">
                {[0, 1, 2, 3].map((pos) => {
                    // Logic: If earthCount is 3, beads 0, 1, 2 are active (pushed up)
                    // In abacus, earth beads push UP to be active.
                    // Visual: Active beads are at the TOP of the bottom section.
                    const isActive = pos < earthCount;
                    return (
                        <Bead
                            key={pos}
                            isActive={isActive}
                            type="earth"
                            // If clicking an inactive bead, it adds to the count. 
                            // If clicking an active bead, it removes it?
                            // Simplified toggle: If I click bead at pos 2, and currently 2 are active, it adds 1? 
                            // Standard abacus: Sliding bead k UP means setting count to at least k+1.
                            onToggle={() => {
                                if (isActive) {
                                    // If bead is active (pushed up), clicking it should deactivate it and beads above it
                                    // e.g. if 3 beads are active (0,1,2), clicking bead 2 makes count 2.
                                    // if 1 bead is active (0), clicking bead 0 makes count 0.
                                    // Target count = pos
                                    // Delta = pos - earthCount
                                    onUpdate(pos - earthCount);
                                } else {
                                    // If inactive, activate up to this bead
                                    // Target count = pos + 1
                                    // Delta = (pos + 1) - earthCount
                                    onUpdate((pos + 1) - earthCount);
                                }
                            }}
                            interactive={interactive}
                        />
                    );
                })}
            </div>
        </div>
    );
}

interface BeadProps {
    isActive: boolean;
    type: 'heaven' | 'earth';
    onToggle: () => void;
    interactive: boolean;
}

function Bead({ isActive, type, onToggle, interactive }: BeadProps) {
    // Brand Colors
    const beadColor = isActive ? "bg-brand-teal ring-2 ring-brand-teal shadow-[0_0_15px_rgba(47,193,164,0.6)]" : "bg-brand-yellow shadow-md hover:bg-brand-yellow/80";

    return (
        <motion.button
            layout
            onClick={interactive ? onToggle : undefined}
            whileHover={interactive ? { scale: 1.1 } : {}}
            whileTap={interactive ? { scale: 0.95 } : {}}
            animate={{
                y: type === 'heaven'
                    ? (isActive ? 15 : -15) // Move Heaven bead closer to/away from divider
                    : (isActive ? -5 : 25)  // Move Earth beads closer to/away from divider 
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`
        relative w-14 h-10 rounded-full z-20 cursor-pointer
        ${beadColor}
        flex items-center justify-center
        ${!interactive && 'cursor-default'}
      `}
        >
            <div className="w-10 h-2 bg-white/30 rounded-full" />
        </motion.button>
    );
}
