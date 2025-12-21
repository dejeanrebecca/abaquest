import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Volume2, Snowflake } from 'lucide-react';


interface FreezeAdditionProps {
  onNext: (coins: number) => void;
}

export function FreezeAddition({ onNext }: FreezeAdditionProps) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { logInteraction } = useDataLogger();

  // Condensed to 3 quick lessons (≈2 minutes total)
  const lessons = [
    { problem: '5 + 0', answer: 5, concept: 'Freeze! Adding zero means nothing changes!' },
    { problem: '0 + 3', answer: 3, concept: 'Starting from zero—let\'s build three!' },
    { problem: '1 + 2', answer: 3, concept: 'Combine beads: one plus two equals three!' },
  ];

  const handleFreeze = () => {
    const startTime = Date.now();
    setIsFrozen(true);

    // Log the interaction
    logInteraction({
      quest_id: 4,
      scene_id: `freeze_addition_lesson_${currentLesson + 1}`,
      number: lessons[currentLesson].answer,
      correct_flag: true,
      time_ms: Date.now() - startTime,
      interaction_type: 'practice',
    });

    setTimeout(() => {
      setIsFrozen(false);
      if (currentLesson < lessons.length - 1) {
        setCurrentLesson(currentLesson + 1);
      } else {
        setShowCelebration(true);
      }
    }, 2000);
  };

  const coinsEarned = 50;

  if (showCelebration) {
    return (
      <motion.div
        key="celebration"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-sunburst-yellow via-warm-neutral to-aqua-blue p-8 flex items-center justify-center relative overflow-hidden"
      >
        {/* Confetti effect */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full"
            style={{
              backgroundColor: ['#FFD44E', '#E34234', '#3BB5C5', '#1A3E68'][i % 4],
              left: `${Math.random() * 100}%`,
              top: '-10%',
            }}
            animate={{
              y: ['0vh', '110vh'],
              rotate: [0, 360],
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              delay: Math.random() * 0.5,
              repeat: Infinity,
            }}
          />
        ))}

        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl border-8 border-sunburst-yellow relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="text-center"
          >
            <div className="text-8xl mb-6">🎉</div>
            <h1 className="text-deep-blue mb-4">Great Job AbaQuester!</h1>
            <p className="text-2xl text-deep-blue/80 mb-8">You mastered Freeze & Addition!</p>

            <div className="bg-sunburst-yellow rounded-2xl p-6 mb-8 border-4 border-deep-blue">
              <div className="text-6xl mb-2">🪙</div>
              <p className="text-3xl text-deep-blue">+{coinsEarned} Quest Coins</p>
            </div>

            <div className="flex gap-4 items-center justify-center mb-8">
              <div className="bg-aqua-blue text-white rounded-full px-6 py-3 text-xl">
                ⭐ Level 1 Complete
              </div>
            </div>

            <Button
              onClick={() => onNext(coinsEarned)}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl text-xl"
              size="lg"
            >
              Continue Adventure! 🚀
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="lesson"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen bg-warm-neutral p-8"
    >


      <div className="max-w-4xl mx-auto">
        {/* Instruction */}
        <div className="bg-gradient-to-r from-aqua-blue to-deep-blue rounded-3xl p-6 mb-6 shadow-xl text-white">
          <div className="flex items-center gap-4">
            <Volume2 className="w-8 h-8 animate-pulse" />
            <p className="text-xl">{lessons[currentLesson].concept}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow">
          <div className="text-center mb-8">
            <p className="text-deep-blue/60 mb-2">Lesson {currentLesson + 1} of {lessons.length}</p>
            <h2 className="text-6xl text-deep-blue mb-4">{lessons[currentLesson].problem} = ?</h2>
          </div>

          {/* Interactive Counter */}
          <div className="flex justify-center mb-12 relative max-h-[320px]">
            <motion.div
              animate={{
                rotate: isFrozen ? [0, -2, 2, -2, 2, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                repeat: isFrozen ? 3 : 0,
              }}
              className="relative"
            >
              {/* Rod */}
              <div className="w-6 h-64 bg-gradient-to-b from-gray-700 to-gray-900 rounded-full shadow-xl mx-auto">
                {/* Upper Bead */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-abacus-red to-red-700 shadow-2xl"
                  style={{ top: '10px' }}
                  animate={{
                    scale: isFrozen ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: isFrozen ? 5 : 0,
                  }}
                />

                {/* Lower Beads */}
                <div className="absolute left-1/2 -translate-x-1/2 flex flex-col gap-2" style={{ top: '100px' }}>
                  {[...Array(lessons[currentLesson].answer)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.2 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-aqua-blue to-blue-600 shadow-xl"
                    />
                  ))}
                </div>
              </div>

              {/* Freeze effect overlay */}
              {isFrozen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-aqua-blue/20 rounded-3xl backdrop-blur-sm flex items-center justify-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: 0
                    }}
                  >
                    <Snowflake className="w-24 h-24 text-aqua-blue" />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Answer Display */}
          {isFrozen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center mb-8"
            >
              <div className="inline-block bg-sunburst-yellow rounded-2xl px-8 py-4 border-4 border-deep-blue">
                <p className="text-4xl text-deep-blue">= {lessons[currentLesson].answer}</p>
              </div>
            </motion.div>
          )}

          {/* Freeze Button */}
          {!isFrozen && (
            <Button
              onClick={handleFreeze}
              className="w-full bg-gradient-to-r from-aqua-blue to-blue-600 hover:from-aqua-blue/90 hover:to-blue-600/90 text-white py-6 rounded-2xl shadow-xl text-xl flex items-center justify-center gap-3"
              size="lg"
            >
              <Snowflake className="w-6 h-6" />
              {currentLesson === 0 ? 'Freeze!' : 'Show Answer'}
            </Button>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {lessons.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${index <= currentLesson ? 'bg-aqua-blue scale-110' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}