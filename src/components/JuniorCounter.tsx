import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export interface JuniorCounterState {
  upperBeadEngaged: boolean;
  lowerBeadsEngaged: number; // 0-4
}

export interface JuniorCounterProps {
  initialState?: JuniorCounterState;
  targetNumber?: number;
  onStateChange?: (state: JuniorCounterState, number: number) => void;
  onCorrect?: () => void;
  onIncorrect?: () => void;
  highlightPart?: 'upper' | 'lower' | 'rod' | null;
  showHints?: boolean;
  disabled?: boolean;
  showValue?: boolean;
  interactive?: boolean;
  size?: 'small' | 'medium' | 'large';
  freezeAnimation?: boolean;
  onBeadMove?: () => void;
}

export function JuniorCounter({
  initialState = { upperBeadEngaged: false, lowerBeadsEngaged: 0 },
  targetNumber,
  onStateChange,
  onCorrect,
  onIncorrect,
  highlightPart = null,
  showHints = false,
  disabled = false,
  showValue = false,
  interactive = true,
  size = 'medium',
  freezeAnimation = false,
  onBeadMove,
}: JuniorCounterProps) {
  const [state, setState] = useState<JuniorCounterState>(initialState);
  const [isShaking, setIsShaking] = useState(false);

  // Calculate current number (0-9)
  const getCurrentNumber = (s: JuniorCounterState): number => {
    return (s.upperBeadEngaged ? 5 : 0) + s.lowerBeadsEngaged;
  };

  const currentNumber = getCurrentNumber(state);

  // Check correctness when state changes
  useEffect(() => {
    if (onStateChange) {
      onStateChange(state, currentNumber);
    }

    if (targetNumber !== undefined && currentNumber === targetNumber) {
      onCorrect?.();
    } else if (targetNumber !== undefined && currentNumber !== targetNumber) {
      // Don't fire onIncorrect immediately, wait for user to "submit"
    }
  }, [state, currentNumber]);

  // Reset to initial state
  const handleReset = () => {
    setState(initialState);
  };

  // Toggle upper bead
  const toggleUpperBead = () => {
    if (!interactive || disabled) return;
    setState(prev => ({
      ...prev,
      upperBeadEngaged: !prev.upperBeadEngaged,
    }));
    onBeadMove?.();

    if (freezeAnimation) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  // Increment lower beads
  const incrementLowerBeads = () => {
    if (!interactive || disabled) return;
    setState(prev => ({
      ...prev,
      lowerBeadsEngaged: Math.min(4, prev.lowerBeadsEngaged + 1),
    }));
    onBeadMove?.();
  };

  // Decrement lower beads
  const decrementLowerBeads = () => {
    if (!interactive || disabled) return;
    setState(prev => ({
      ...prev,
      lowerBeadsEngaged: Math.max(0, prev.lowerBeadsEngaged - 1),
    }));
    onBeadMove?.();
  };

  // Size configurations
  const sizeConfig = {
    small: {
      rod: 'w-4 h-48',
      upperBead: 'w-12 h-12',
      lowerBead: 'w-10 h-10',
      gap: 'gap-1',
    },
    medium: {
      rod: 'w-6 h-64',
      upperBead: 'w-16 h-16',
      lowerBead: 'w-14 h-14',
      gap: 'gap-2',
    },
    large: {
      rod: 'w-8 h-80',
      upperBead: 'w-20 h-20',
      lowerBead: 'w-16 h-16',
      gap: 'gap-3',
    },
  };

  const config = sizeConfig[size];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Value Display */}
      {showValue && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-sunburst-yellow text-deep-blue rounded-2xl px-6 py-3 border-4 border-deep-blue shadow-xl"
        >
          <p className="text-4xl font-bold">{currentNumber}</p>
        </motion.div>
      )}

      {/* Abacus Structure */}
      <motion.div
        animate={
          freezeAnimation && isShaking
            ? {
                rotate: [0, -2, 2, -2, 2, 0],
                scale: [1, 1.02, 1],
              }
            : {}
        }
        transition={{ duration: 0.5 }}
        className="relative flex flex-col items-center"
      >
        {/* Upper Bead (Heaven Bead - represents 5) */}
        <div className="relative">
          <motion.button
            onClick={toggleUpperBead}
            disabled={!interactive || disabled}
            whileHover={interactive && !disabled ? { scale: 1.1 } : {}}
            whileTap={interactive && !disabled ? { scale: 0.9 } : {}}
            animate={{
              y: state.upperBeadEngaged ? 20 : 0,
            }}
            className={`${config.upperBead} rounded-full shadow-2xl transition-all duration-300 relative z-10 ${
              highlightPart === 'upper'
                ? 'bg-sunburst-yellow ring-4 ring-aqua-blue animate-pulse'
                : 'bg-gradient-to-br from-abacus-red to-red-700'
            } ${interactive && !disabled ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {showHints && targetNumber !== undefined && targetNumber >= 5 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute inset-0 rounded-full border-4 border-sunburst-yellow"
              />
            )}
          </motion.button>
        </div>

        {/* Divider Bar */}
        <div className="w-24 h-1 bg-gray-800 my-2 rounded-full shadow-lg" />

        {/* Answer Rod (Body) */}
        <div
          className={`${config.rod} bg-gradient-to-b from-gray-700 to-gray-900 rounded-full shadow-xl relative ${
            highlightPart === 'rod' ? 'ring-4 ring-sunburst-yellow' : ''
          }`}
        >
          {/* Lower Beads Container (Earth Beads - represent 1 each) */}
          <div className={`absolute top-4 left-1/2 -translate-x-1/2 flex flex-col ${config.gap}`}>
            {[0, 1, 2, 3].map(index => {
              const isEngaged = index < state.lowerBeadsEngaged;
              const showHint =
                showHints &&
                targetNumber !== undefined &&
                targetNumber % 5 > index &&
                targetNumber < 5;

              return (
                <motion.button
                  key={index}
                  onClick={isEngaged ? decrementLowerBeads : incrementLowerBeads}
                  disabled={!interactive || disabled}
                  whileHover={interactive && !disabled ? { scale: 1.1 } : {}}
                  whileTap={interactive && !disabled ? { scale: 0.9 } : {}}
                  animate={{
                    x: isEngaged ? -5 : 0,
                    scale: isEngaged ? 1.05 : 1,
                  }}
                  className={`${config.lowerBead} rounded-full shadow-xl transition-all duration-200 relative ${
                    highlightPart === 'lower' || showHint
                      ? 'bg-sunburst-yellow ring-4 ring-aqua-blue'
                      : isEngaged
                      ? 'bg-gradient-to-br from-aqua-blue to-blue-600'
                      : 'bg-gradient-to-br from-gray-400 to-gray-500'
                  } ${interactive && !disabled ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {showHint && (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full border-4 border-sunburst-yellow"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Freeze Effect Overlay */}
        {freezeAnimation && isShaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-6xl">❄️</div>
          </motion.div>
        )}
      </motion.div>

      {/* Controls */}
      {interactive && !disabled && (
        <div className="flex gap-3 items-center">
          <Button
            onClick={handleReset}
            variant="outline"
            size="sm"
            className="border-2 border-deep-blue text-deep-blue hover:bg-deep-blue hover:text-white rounded-xl"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>

          {showHints && targetNumber !== undefined && (
            <div className="bg-aqua-blue/10 text-deep-blue px-4 py-2 rounded-xl border-2 border-aqua-blue text-sm">
              <Sparkles className="w-4 h-4 inline mr-1" />
              Try to make: {targetNumber}
            </div>
          )}
        </div>
      )}

      {/* Part Labels (for learning) */}
      {highlightPart && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-deep-blue text-white px-6 py-3 rounded-xl shadow-lg text-center"
        >
          {highlightPart === 'upper' && '⬆️ Upper Bead (Head) = 5'}
          {highlightPart === 'lower' && '⬇️ Lower Beads (Legs) = 1 each'}
          {highlightPart === 'rod' && '| Answer Rod (Body)'}
        </motion.div>
      )}
    </div>
  );
}

// Helper function to convert number to counter state
export function numberToCounterState(num: number): JuniorCounterState {
  if (num < 0 || num > 9) {
    throw new Error('Number must be between 0 and 9');
  }

  return {
    upperBeadEngaged: num >= 5,
    lowerBeadsEngaged: num % 5,
  };
}

// Helper function to get preset states
export const COUNTER_PRESETS = {
  zero: { upperBeadEngaged: false, lowerBeadsEngaged: 0 },
  one: { upperBeadEngaged: false, lowerBeadsEngaged: 1 },
  five: { upperBeadEngaged: true, lowerBeadsEngaged: 0 },
  nine: { upperBeadEngaged: true, lowerBeadsEngaged: 4 },
};
