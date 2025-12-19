import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Lock, CheckCircle, Play } from 'lucide-react';
import { useQuestEngine } from '../QuestEngine';
import { QUESTS, QuestId } from '../../types/quest';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

interface LibraryProps {
  onSelectQuest: (questId: QuestId) => void;
}

export function Library({ onSelectQuest }: LibraryProps) {
  const { studentProgress, isQuestUnlocked, currentQuest } = useQuestEngine();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-deep-blue via-aqua-blue to-warm-neutral p-8"
    >
      {/* Header */}
      <div className="flex justify-center mb-8">
        <img
          src={logo}
          alt="AbaQuest"
          className="w-40 h-40 object-cover rounded-full drop-shadow-xl border-4 border-white"
        />
      </div>

      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-white mb-4">Quest Library</h1>
          <p className="text-white/90 text-xl">
            {studentProgress.studentName && `Welcome back, ${studentProgress.studentName}!`}
          </p>
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
              <p className="text-white/80 text-sm">Total Coins</p>
              <p className="text-3xl text-sunburst-yellow">🪙 {studentProgress.totalCoins}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
              <p className="text-white/80 text-sm">Level</p>
              <p className="text-3xl text-white">⭐ {studentProgress.level}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-3">
              <p className="text-white/80 text-sm">Quests Complete</p>
              <p className="text-3xl text-white">🏆 {studentProgress.completedQuests.length}/4</p>
            </div>
          </div>
        </motion.div>

        {/* Quest Grid */}
        <div className="grid grid-cols-2 gap-6">
          {(Object.values(QUESTS) as typeof QUESTS[QuestId][]).map((quest, index) => {
            const isUnlocked = isQuestUnlocked(quest.id);
            const isCompleted = studentProgress.completedQuests.includes(quest.id);
            const isInProgress = currentQuest === quest.id;
            const progress = studentProgress.questProgress[quest.id];

            return (
              <motion.div
                key={quest.id}
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative ${!isUnlocked ? 'opacity-60' : ''}`}
              >
                <div
                  className={`bg-white rounded-3xl shadow-2xl p-8 border-4 ${
                    isInProgress
                      ? 'border-sunburst-yellow'
                      : isCompleted
                      ? 'border-green-500'
                      : isUnlocked
                      ? 'border-aqua-blue'
                      : 'border-gray-300'
                  } transition-all duration-300 ${
                    isUnlocked ? 'hover:scale-105 cursor-pointer' : ''
                  }`}
                  onClick={() => isUnlocked && onSelectQuest(quest.id)}
                >
                  {/* Quest Icon & Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-6xl">{quest.icon}</div>
                    {isCompleted && (
                      <CheckCircle className="w-10 h-10 text-green-500 fill-green-100" />
                    )}
                    {!isUnlocked && (
                      <Lock className="w-10 h-10 text-gray-400" />
                    )}
                    {isInProgress && (
                      <div className="bg-sunburst-yellow text-deep-blue px-3 py-1 rounded-full text-sm font-semibold">
                        In Progress
                      </div>
                    )}
                  </div>

                  {/* Quest Info */}
                  <h2 className="text-deep-blue mb-2">{quest.title}</h2>
                  <p className="text-deep-blue/70 mb-4">{quest.description}</p>

                  {/* Quest Metadata */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-deep-blue/60">
                    <span>⏱️ ~{quest.estimatedMinutes} min</span>
                    <span>🪙 {quest.coinReward} coins</span>
                  </div>

                  {/* Progress Bar (if completed) */}
                  {progress && isCompleted && (
                    <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-green-900">Pre-Test: {progress.preTestScore}%</span>
                        <span className="text-green-900">Post-Test: {progress.postTestScore}%</span>
                      </div>
                      <div className="flex justify-center">
                        <span className="text-green-700 font-semibold">
                          Gain: +{progress.postTestScore - progress.preTestScore}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* CTA Button */}
                  {isUnlocked && !isCompleted && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectQuest(quest.id);
                      }}
                      className={`w-full mt-4 ${
                        isInProgress
                          ? 'bg-sunburst-yellow hover:bg-sunburst-yellow/90 text-deep-blue'
                          : 'bg-abacus-red hover:bg-abacus-red/90 text-white'
                      } py-4 rounded-2xl shadow-xl`}
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {isInProgress ? 'Continue Quest' : 'Start Quest'}
                    </Button>
                  )}

                  {isCompleted && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectQuest(quest.id);
                      }}
                      variant="outline"
                      className="w-full mt-4 border-2 border-green-500 text-green-700 hover:bg-green-50 py-4 rounded-2xl"
                    >
                      ↺ Replay Quest
                    </Button>
                  )}

                  {!isUnlocked && (
                    <div className="mt-4 bg-gray-100 rounded-2xl p-4 text-center">
                      <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">
                        Complete Quest {quest.id - 1} to unlock
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}