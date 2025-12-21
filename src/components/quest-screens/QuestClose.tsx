import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Trophy, Star, Coins, ArrowRight } from 'lucide-react';


interface QuestCloseProps {
  questTitle: string;
  questIcon: string;
  preTestScore: number;
  postTestScore: number;
  coinsEarned: number;
  learningGain: number;
  summary: string;
  onNext: () => void;
  nextButtonText?: string;
}

export function QuestClose({
  questTitle,
  questIcon,
  preTestScore,
  postTestScore,
  coinsEarned,
  learningGain,
  summary,
  onNext,
  nextButtonText = 'Continue to Library! 🏛️',
}: QuestCloseProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-sunburst-yellow via-warm-neutral to-aqua-blue p-8 flex items-center justify-center relative overflow-hidden"
    >
      {/* Confetti effect */}
      {[...Array(40)].map((_, i) => (
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
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 0.5,
            repeat: Infinity,
          }}
        />
      ))}

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-3xl border-8 border-sunburst-yellow relative z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          {/* Celebration */}
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-deep-blue mb-4">Quest Complete!</h1>
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="text-4xl">{questIcon}</div>
            <p className="text-2xl text-deep-blue/80">{questTitle}</p>
          </div>

          {/* Summary */}
          <div className="bg-aqua-blue/10 rounded-2xl p-6 mb-8 border-2 border-aqua-blue">
            <p className="text-deep-blue text-lg">{summary}</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Pre-Test Score */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border-4 border-blue-300">
              <div className="text-3xl mb-2">📋</div>
              <p className="text-blue-900/60 text-sm mb-1">Pre-Test</p>
              <p className="text-3xl text-blue-900">{preTestScore}%</p>
            </div>

            {/* Post-Test Score */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-4 border-green-400">
              <div className="text-3xl mb-2">✅</div>
              <p className="text-green-900/60 text-sm mb-1">Post-Test</p>
              <p className="text-3xl text-green-900">{postTestScore}%</p>
            </div>
          </div>

          {/* Learning Gain */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
            className={`rounded-2xl p-6 mb-8 border-4 ${learningGain > 0
                ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-500'
                : learningGain < 0
                  ? 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-500'
                  : 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400'
              }`}
          >
            <div className="flex items-center justify-center gap-4">
              <Trophy
                className={`w-10 h-10 ${learningGain > 0 ? 'text-green-600' : 'text-gray-600'
                  }`}
              />
              <div>
                <p className="text-deep-blue/70 text-sm mb-1">Learning Gain</p>
                <p className="text-5xl text-deep-blue">
                  {learningGain > 0 ? '+' : ''}
                  {learningGain}%
                </p>
              </div>
              {learningGain > 0 && <Star className="w-10 h-10 text-sunburst-yellow fill-sunburst-yellow" />}
            </div>
          </motion.div>

          {/* Coins Earned */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, type: 'spring' }}
            className="bg-gradient-to-r from-sunburst-yellow to-orange-300 rounded-2xl p-8 mb-8 border-4 border-deep-blue shadow-xl"
          >
            <div className="flex items-center justify-center gap-4">
              <Coins className="w-12 h-12 text-deep-blue" />
              <div>
                <p className="text-deep-blue/80 text-sm mb-1">Quest Coins Earned</p>
                <p className="text-6xl text-deep-blue">+{coinsEarned}</p>
              </div>
              <div className="text-6xl">🪙</div>
            </div>
          </motion.div>

          {/* Encouragement */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-8 border-2 border-purple-300">
            <p className="text-deep-blue text-lg">
              {learningGain > 20
                ? '🌟 Amazing growth! You are becoming a math master!'
                : learningGain > 0
                  ? '💪 Great work! You learned something new today!'
                  : '🎯 Keep practicing! Every AbaQuester grows at their own pace!'}
            </p>
          </div>

          {/* Next Button */}
          <Button
            onClick={onNext}
            className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl text-xl"
            size="lg"
          >
            {nextButtonText}
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </motion.div>
      </div>


    </motion.div>
  );
}