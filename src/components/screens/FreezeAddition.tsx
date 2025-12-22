import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Volume2, CheckCircle, ArrowRight } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { useAbacusSound } from '../../hooks/useAbacusSound';




interface FreezeAdditionProps {
  onNext: (coins: number) => void;
}

export function FreezeAddition({ onNext }: FreezeAdditionProps) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { logInteraction } = useDataLogger();
  const { playSuccess } = useAbacusSound();


  // Condensed to 3 quick lessons
  const lessons = [
    {
      problem1: 5, problem2: 0, answer: 5,
      concept: 'Freeze! Adding zero means nothing changes!',
      prompt: "Set the abacus to 5. Adding zero changes nothing!"
    },
    {
      problem1: 0, problem2: 3, answer: 3,
      concept: 'Starting from zero—let\'s build three!',
      prompt: "Start at 0. Add 3 beads. What do you get?"
    },
    {
      problem1: 1, problem2: 2, answer: 3,
      concept: 'Combine beads: one plus two equals three!',
      prompt: "Start with 1. Add 2 more. What is the sum?"
    },
  ];

  const currentLessonData = lessons[currentLesson];

  const handleAbacusChange = (value: number) => {
    // Only check if not already frozen/correct
    if (isFrozen) return;

    if (value === currentLessonData.answer) {
      // Debounce success
      setTimeout(() => {
        handleLessonSuccess(value);
      }, 500);
    }
  };

  const handleLessonSuccess = (value: number) => {
    if (isFrozen) return;

    const startTime = Date.now();
    setIsFrozen(true);
    playSuccess();

    // Log the interaction
    logInteraction({
      quest_id: 4,
      scene_id: `freeze_addition_lesson_${currentLesson + 1}`,
      number: value,
      correct_flag: true,
      time_ms: Date.now() - startTime,
      interaction_type: 'practice',
      student_response: value.toString()
    });
  };

  const handleNextLesson = () => {
    setIsFrozen(false);
    if (currentLesson < lessons.length - 1) {
      setCurrentLesson(currentLesson + 1);
    } else {
      setShowCelebration(true);
    }
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
        <div className="bg-gradient-to-r from-brand-teal to-brand-purple rounded-3xl p-6 mb-6 shadow-xl text-white">
          <div className="flex items-center gap-4">
            <Volume2 className="w-8 h-8 animate-pulse" />
            <div>
              <p className="text-xl font-bold">{currentLessonData.concept}</p>
              <p className="text-white/80">{currentLessonData.prompt}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-brand-yellow">
          <div className="text-center mb-8">
            <p className="text-brand-text-muted mb-2 font-bold">Lesson {currentLesson + 1} of {lessons.length}</p>
            <h2 className="text-6xl text-brand-text mb-4 font-extrabold">
              {currentLessonData.problem1} + {currentLessonData.problem2} = ?
            </h2>
          </div>

          {/* Interactive Counter */}
          <div className="flex justify-center mb-12 relative min-h-[300px]">
            <div className="scale-125 origin-top">
              <InteractiveAbacus
                interactive={!isFrozen}
                onChange={handleAbacusChange}
                rods={1}
                key={currentLesson} // Reset on new lesson
              />
            </div>

            {/* Freeze effect overlay */}
            <AnimatePresence>
              {isFrozen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-brand-teal/10 rounded-3xl backdrop-blur-[2px] flex items-center justify-center pointer-events-none"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1, rotate: 360 }}
                    transition={{ type: "spring" }}
                    className="bg-white p-4 rounded-full shadow-2xl border-4 border-brand-teal"
                  >
                    <CheckCircle className="w-16 h-16 text-brand-teal" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Feedback & Navigation */}
          <AnimatePresence>
            {isFrozen && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="inline-block bg-brand-yellow rounded-2xl px-8 py-4 border-4 border-brand-purple mb-6">
                  <p className="text-4xl text-brand-purple font-bold">
                    Correct! It's {currentLessonData.answer}!
                  </p>
                </div>

                <Button
                  onClick={handleNextLesson}
                  className="w-full bg-brand-success hover:bg-brand-success/90 text-white py-6 rounded-2xl shadow-xl text-xl flex items-center justify-center gap-3"
                  size="lg"
                >
                  {currentLesson < lessons.length - 1 ? "Next Challenge" : "Finish Quest!"}
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-6">
            {lessons.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all ${index <= currentLesson ? 'bg-brand-teal scale-110' : 'bg-gray-300'
                  }`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>

  );
}