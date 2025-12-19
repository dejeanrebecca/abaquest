import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Trophy, Star, Coins } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

interface RewardsProps {
  coins: number;
  onNext: () => void;
}

export function Rewards({ coins, onNext }: RewardsProps) {
  const { getPostTestScore } = useDataLogger();
  const postTestScore = getPostTestScore();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-200 via-warm-neutral to-sunburst-yellow p-8 flex items-center justify-center"
    >
      <div className="max-w-3xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img src={logo} alt="AbaQuest" className="w-48 h-48 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>

        {/* Main Reward Card */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl p-12 border-8 border-sunburst-yellow"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 150 }}
            >
              <Trophy className="w-32 h-32 mx-auto mb-6 text-sunburst-yellow" fill="currentColor" />
            </motion.div>

            <h1 className="text-deep-blue mb-4">Quest Complete!</h1>
            <p className="text-2xl text-deep-blue/80 mb-8">You're becoming a math master! 🎉</p>

            {/* Rewards Grid */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-br from-sunburst-yellow to-yellow-300 rounded-2xl p-6 border-4 border-deep-blue shadow-lg"
              >
                <Coins className="w-12 h-12 mx-auto mb-3 text-deep-blue" />
                <p className="text-4xl text-deep-blue mb-2">{coins}</p>
                <p className="text-deep-blue/80">Quest Coins</p>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gradient-to-br from-aqua-blue to-blue-400 rounded-2xl p-6 border-4 border-deep-blue shadow-lg text-white"
              >
                <Star className="w-12 h-12 mx-auto mb-3" fill="white" />
                <p className="text-4xl mb-2">Level 1</p>
                <p className="text-white/90">Badge Earned</p>
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-abacus-red to-red-500 rounded-2xl p-6 border-4 border-deep-blue shadow-lg text-white"
              >
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-4xl mb-2">{postTestScore}%</p>
                <p className="text-white/90">Post-Test</p>
              </motion.div>
            </div>

            {/* Achievement Message */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-deep-blue/5 rounded-2xl p-6 mb-8 border-2 border-deep-blue/20"
            >
              <p className="text-xl text-deep-blue">
                🌟 You unlocked: <span className="text-abacus-red">Junior Counter Master Badge</span>
              </p>
            </motion.div>

            {/* CTA Buttons */}
            <div className="space-y-4">
              <Button
                onClick={onNext}
                className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl text-xl"
                size="lg"
              >
                View All Quests 📚
              </Button>
              
              <p className="text-deep-blue/60">Keep learning to unlock more adventures!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}