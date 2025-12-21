import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Volume2, ChevronRight } from 'lucide-react';


interface StoryIntroProps {
  onNext: () => void;
}

export function StoryIntro({ onNext }: StoryIntroProps) {
  const [currentScene, setCurrentScene] = useState(0);

  const scenes = [
    {
      speaker: 'Abby',
      text: "Welcome, young AbaQuester! I'm so happy you're here. Today, you're joining a very special place — Mistress Creola's School of Mental Math!",
      highlight: "It's a magical school where numbers come alive, and every student learns to use their Junior Counter to solve puzzles and explore new worlds.",
    },
    {
      speaker: 'Abby',
      text: "But wait! Some of the students at the school need your help. Their counters are mixed up, their beads are out of place, and they can't finish their math challenges without you!",
      highlight: "That's where you come in — a brave AbaQuester ready to help your friends, use your math powers, and earn Quest Coins for every challenge you complete.",
    },
    {
      speaker: 'Abby',
      text: "So grab your Junior Counter, take a deep breath, and get ready to begin your first quest!",
      highlight: "Are you ready to help the School of Mental Math? Let's go, AbaQuester!",
    },
  ];

  const handleNext = () => {
    if (currentScene < scenes.length - 1) {
      setCurrentScene(currentScene + 1);
    } else {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-deep-blue via-aqua-blue to-warm-neutral p-8"
    >


      {/* Story Content */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow"
          >
            {/* Speaker Header */}
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-deep-blue to-aqua-blue rounded-2xl p-4">
              <div className="w-16 h-16 bg-sunburst-yellow rounded-full flex items-center justify-center shadow-lg">
                <div className="w-8 h-8 bg-abacus-red rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white">Abby - Your AI Guide</h3>
              </div>
              <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all">
                <Volume2 className="w-6 h-6" />
              </button>
            </div>

            {/* Story Text */}
            <div className="space-y-4 mb-8">
              <p className="text-deep-blue text-xl leading-relaxed">
                {scenes[currentScene].text}
              </p>
              <p className="text-abacus-red text-xl leading-relaxed">
                {scenes[currentScene].highlight}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-2 justify-center mb-6">
              {scenes.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${index === currentScene
                      ? 'w-8 bg-abacus-red'
                      : index < currentScene
                        ? 'w-2 bg-aqua-blue'
                        : 'w-2 bg-gray-300'
                    }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <Button
              onClick={handleNext}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              size="lg"
            >
              {currentScene < scenes.length - 1 ? (
                <>
                  Continue <ChevronRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                "Let's Begin the Adventure! 🚀"
              )}
            </Button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-sunburst-yellow/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-white/20 rounded-full blur-2xl"></div>
    </motion.div>
  );
}
