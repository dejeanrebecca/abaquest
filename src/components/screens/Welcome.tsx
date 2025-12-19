import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Volume2 } from 'lucide-react';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

interface WelcomeProps {
  onNext: (emotion: string) => void;
}

export function Welcome({ onNext }: WelcomeProps) {
  const [selectedEmotion, setSelectedEmotion] = useState('');

  const emotions = [
    { emoji: '😊', label: 'Excited!', value: 'excited', color: 'bg-green-100' },
    { emoji: '🙂', label: 'Good', value: 'good', color: 'bg-blue-100' },
    { emoji: '😐', label: 'Okay', value: 'okay', color: 'bg-yellow-100' },
    { emoji: '😟', label: 'Nervous', value: 'nervous', color: 'bg-orange-100' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-b from-sky-200 via-warm-neutral to-warm-neutral p-8 flex flex-col items-center justify-center"
    >
      {/* Logo */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <img src={logo} alt="AbaQuest" className="w-64 h-64 object-cover rounded-full drop-shadow-xl border-4 border-white" />
      </motion.div>

      {/* Background illustration elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-sunburst-yellow/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-aqua-blue/20 rounded-full blur-2xl"></div>

      {/* Welcome Message */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl border-4 border-deep-blue relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-deep-blue mb-4">Hi AbaQuester!</h1>
          <p className="text-deep-blue/80 text-xl">How are you feeling about math today?</p>
        </div>

        {/* Emotion Selector */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {emotions.map((emotion, index) => (
            <motion.button
              key={emotion.value}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              onClick={() => setSelectedEmotion(emotion.value)}
              className={`p-6 rounded-2xl border-4 transition-all duration-300 ${
                selectedEmotion === emotion.value
                  ? 'border-aqua-blue bg-aqua-blue/10 scale-105 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-sunburst-yellow hover:shadow-md'
              }`}
            >
              <div className="text-6xl mb-2">{emotion.emoji}</div>
              <div className="text-deep-blue">{emotion.label}</div>
            </motion.button>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            onClick={() => selectedEmotion && onNext(selectedEmotion)}
            disabled={!selectedEmotion}
            className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            Let's Begin! 🚀
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}