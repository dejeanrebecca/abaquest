import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Volume2, CheckCircle } from 'lucide-react';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

interface LearnPartsProps {
  onNext: () => void;
}

type Part = 'upper' | 'lower' | 'rod' | null;

export function LearnParts({ onNext }: LearnPartsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPart, setSelectedPart] = useState<Part>(null);
  const [completedTasks, setCompletedTasks] = useState<Part[]>([]);

  const tasks = [
    { part: 'upper' as Part, instruction: 'Tap the Upper Bead (Head)' },
    { part: 'lower' as Part, instruction: 'Tap a Lower Bead (Legs)' },
    { part: 'rod' as Part, instruction: 'Tap the Answer Rod (Body)' },
  ];

  const handlePartClick = (part: Part) => {
    if (currentStep < tasks.length && part === tasks[currentStep].part) {
      setSelectedPart(part);
      setCompletedTasks([...completedTasks, part]);
      setTimeout(() => {
        if (currentStep < tasks.length - 1) {
          setCurrentStep(currentStep + 1);
          setSelectedPart(null);
        }
      }, 1000);
    }
  };

  const isCompleted = completedTasks.length === tasks.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen bg-warm-neutral p-8"
    >
      {/* Header */}
      <div className="flex justify-center mb-6">
        <img src={logo} alt="AbaQuest" className="w-40 h-40 object-cover rounded-full drop-shadow-lg border-4 border-white" />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Instruction Panel */}
        <motion.div
          className="bg-deep-blue rounded-3xl p-6 mb-8 shadow-xl text-white"
          key={currentStep}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="flex items-center gap-4">
            <Volume2 className="w-8 h-8 animate-pulse" />
            <div className="flex-1">
              <p className="text-lg">
                {isCompleted ? '🎉 Great job! You know all the parts!' : tasks[currentStep]?.instruction}
              </p>
            </div>
            <div className="flex gap-2">
              {tasks.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < completedTasks.length ? 'bg-sunburst-yellow' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Interactive Abacus */}
        <div className="bg-white rounded-3xl shadow-2xl p-12 border-4 border-aqua-blue">
          <h2 className="text-deep-blue text-center mb-8">Meet Your Junior Counter</h2>

          {/* 3D Abacus Illustration */}
          <div className="relative flex justify-center items-center min-h-[400px]">
            {/* Answer Rod (Body) */}
            <motion.button
              onClick={() => handlePartClick('rod')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute w-6 rounded-full shadow-lg transition-all duration-300 ${
                selectedPart === 'rod' || completedTasks.includes('rod')
                  ? 'bg-sunburst-yellow ring-4 ring-aqua-blue'
                  : 'bg-gradient-to-b from-gray-700 to-gray-900'
              }`}
              style={{ height: '360px', top: '20px' }}
            >
              {completedTasks.includes('rod') && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-10 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle className="w-8 h-8 text-green-500 fill-white" />
                </motion.div>
              )}
            </motion.button>

            {/* Upper Bead (Head) - Heaven Bead */}
            <motion.button
              onClick={() => handlePartClick('upper')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                y: selectedPart === 'upper' ? 10 : 0,
              }}
              className={`absolute w-20 h-20 rounded-full shadow-2xl transition-all duration-300 ${
                selectedPart === 'upper' || completedTasks.includes('upper')
                  ? 'bg-sunburst-yellow ring-4 ring-aqua-blue'
                  : 'bg-gradient-to-br from-abacus-red to-red-700'
              }`}
              style={{ top: '20px' }}
            >
              {completedTasks.includes('upper') && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -right-12 top-1/2 -translate-y-1/2"
                >
                  <CheckCircle className="w-8 h-8 text-green-500 fill-white" />
                </motion.div>
              )}
            </motion.button>

            {/* Lower Beads (Legs) - Earth Beads */}
            <div className="absolute flex flex-col gap-4" style={{ top: '140px' }}>
              {[0, 1, 2, 3].map((index) => (
                <motion.button
                  key={index}
                  onClick={() => handlePartClick('lower')}
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    x: selectedPart === 'lower' ? -10 : 0,
                  }}
                  className={`w-16 h-16 rounded-full shadow-xl transition-all duration-300 ${
                    selectedPart === 'lower' || completedTasks.includes('lower')
                      ? 'bg-sunburst-yellow ring-4 ring-aqua-blue'
                      : 'bg-gradient-to-br from-aqua-blue to-blue-600'
                  }`}
                >
                  {index === 0 && completedTasks.includes('lower') && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-12 top-1/2 -translate-y-1/2"
                    >
                      <CheckCircle className="w-8 h-8 text-green-500 fill-white" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Labels */}
            <AnimatePresence>
              {completedTasks.includes('upper') && (
                <motion.div
                  key="upper-label"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-1/2 ml-32 top-12 bg-deep-blue text-white px-4 py-2 rounded-xl shadow-lg"
                >
                  Upper Bead (Head)
                </motion.div>
              )}
              {completedTasks.includes('lower') && (
                <motion.div
                  key="lower-label"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-1/2 ml-32 top-52 bg-deep-blue text-white px-4 py-2 rounded-xl shadow-lg"
                >
                  Lower Beads (Legs)
                </motion.div>
              )}
              {completedTasks.includes('rod') && (
                <motion.div
                  key="rod-label"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-1/2 ml-32 top-32 bg-deep-blue text-white px-4 py-2 rounded-xl shadow-lg"
                >
                  Answer Rod (Body)
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Next Button */}
          {isCompleted && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-8"
            >
              <Button
                onClick={onNext}
                className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
                size="lg"
              >
                Continue to Numbers! 🎯
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}