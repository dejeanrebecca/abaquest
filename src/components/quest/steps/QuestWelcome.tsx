import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../../ui/button';
import { Volume2 } from 'lucide-react';
import { QuestId, QUEST_METADATA } from '../../../types/quest';
import { useDataLogger } from '../../DataLogger';


interface QuestWelcomeProps {
  questId: QuestId;
  onComplete: () => void;
}

export function QuestWelcome({ questId, onComplete }: QuestWelcomeProps) {
  const [selectedEmotion, setSelectedEmotion] = useState('');
  const { logInteraction } = useDataLogger();
  const metadata = QUEST_METADATA[questId];

  const emotions = [
    { emoji: '😊', label: 'Excited!', value: 'excited' },
    { emoji: '🙂', label: 'Good', value: 'good' },
    { emoji: '😐', label: 'Okay', value: 'okay' },
    { emoji: '😟', label: 'Nervous', value: 'nervous' },
  ];

  const handleContinue = () => {
    // Log emotional check-in
    logInteraction({
      quest_id: questId,
      scene_id: 'welcome_emotion_checkin',
      number: null,
      correct_flag: null,
      time_ms: 0,
      interaction_type: 'practice',
      student_response: selectedEmotion,
    });
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 via-warm-neutral to-warm-neutral p-8 flex flex-col items-center justify-center">


      {/* Welcome Card */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl border-4 border-deep-blue relative z-10"
      >
        {/* Quest Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{metadata.icon}</div>
          <h1 className="text-deep-blue mb-2">Quest {questId}: {metadata.title}</h1>
          <p className="text-deep-blue/70 text-xl mb-4">{metadata.subtitle}</p>
        </div>

        {/* Abby Introduction */}
        <div className="bg-gradient-to-r from-deep-blue to-aqua-blue rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-sunburst-yellow rounded-full flex items-center justify-center shadow-lg">
              <div className="w-6 h-6 bg-abacus-red rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-white">Abby - Your AI Guide</p>
            </div>
            <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all">
              <Volume2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white text-lg">
            {getWelcomeMessage(questId)}
          </p>
        </div>

        {/* Emotional Check-in */}
        <div className="mb-8">
          <p className="text-deep-blue text-center mb-4">
            How are you feeling about this quest today?
          </p>
          <div className="grid grid-cols-2 gap-4">
            {emotions.map((emotion, index) => (
              <motion.button
                key={emotion.value}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                onClick={() => setSelectedEmotion(emotion.value)}
                className={`p-6 rounded-2xl border-4 transition-all duration-300 ${selectedEmotion === emotion.value
                    ? 'border-aqua-blue bg-aqua-blue/10 scale-105 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-sunburst-yellow hover:shadow-md'
                  }`}
              >
                <div className="text-5xl mb-2">{emotion.emoji}</div>
                <div className="text-deep-blue">{emotion.label}</div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedEmotion}
          className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          size="lg"
        >
          Let's Start This Quest! 🚀
        </Button>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-sunburst-yellow/20 rounded-full blur-2xl"></div>
      <div className="absolute bottom-40 right-20 w-40 h-40 bg-aqua-blue/20 rounded-full blur-2xl"></div>
    </div>
  );
}

function getWelcomeMessage(questId: QuestId): string {
  const messages = {
    1: "Welcome to your first quest! Today you'll meet your Junior Counter and give it a special name. This is going to be fun!",
    2: "Great to see you, AbaQuester! In this quest, you'll discover the different parts of your Junior Counter. Each part has a special job!",
    3: "You're doing amazing! Today we'll learn where numbers 0 through 9 live on your Junior Counter. It's like a treasure map!",
    4: "You've come so far! In this quest, you'll learn the Freeze Rule and how to add numbers. You're becoming a true AbaQuester!",
  };
  return messages[questId];
}
