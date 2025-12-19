import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Volume2, ChevronRight, Ship, ArrowRight } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

interface NameCounterProps {
  onNext: (name: string) => void;
}

export function NameCounter({ onNext }: NameCounterProps) {
  const [step, setStep] = useState(0);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [customName, setCustomName] = useState('');
  const [boatPath, setBoatPath] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState('');
  const { setStudentName } = useDataLogger();

  const avatarFriends = [
    { name: 'Coco', color: 'bg-orange-400', accent: 'bg-orange-600', intro: "Hi! I'm Coco. I love coconuts and counting by ones!" },
    { name: 'Nova', color: 'bg-purple-400', accent: 'bg-purple-600', intro: "Hey there! I'm Nova. I shine bright when I solve math puzzles!" },
    { name: 'Bolt', color: 'bg-yellow-400', accent: 'bg-yellow-600', intro: "Yo! I'm Bolt. I'm super fast at moving beads!" },
    { name: 'Zippy', color: 'bg-green-400', accent: 'bg-green-600', intro: "Hello! I'm Zippy. I zip through numbers like a pro!" },
    { name: 'Spark', color: 'bg-red-400', accent: 'bg-red-600', intro: "Hi friend! I'm Spark. I make math feel like magic!" },
    { name: 'Luna', color: 'bg-blue-400', accent: 'bg-blue-600', intro: "Greetings! I'm Luna. I love exploring number patterns!" },
    { name: 'Beady', color: 'bg-pink-400', accent: 'bg-pink-600', intro: "Hey! I'm Beady. My beads are always ready to count!" },
  ];

  const handleConfirm = () => {
    const finalName = customName || selectedAvatar;
    if (finalName) {
      setStudentName(finalName);
      onNext(finalName);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: // Story introduction
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-deep-blue"
          >
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-deep-blue to-aqua-blue rounded-2xl p-4">
              <Volume2 className="w-8 h-8 text-white animate-pulse" />
              <h3 className="text-white">Story Time</h3>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-deep-blue text-xl leading-relaxed">
                "It was the twins' first day at the School of Mental Math.
              </p>
              <p className="text-deep-blue text-xl leading-relaxed">
                Ameerah was curious about who her new friends would be.
              </p>
              <p className="text-deep-blue text-xl leading-relaxed">
                Ameer hoped the math wouldn't be too hard, he was nervous.
              </p>
              <p className="text-deep-blue text-xl leading-relaxed">
                They were both quiet as they walked to their boat.
              </p>
              <p className="text-deep-blue text-xl leading-relaxed">
                Ameer's heart beat fast.
              </p>
              <p className="text-abacus-red text-xl leading-relaxed">
                Ameerah smiled and said, "I'll steer today!" She was nervous too—but ready to be brave."
              </p>
            </div>

            <Button
              onClick={() => setStep(1)}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              size="lg"
            >
              Continue the Journey <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        );

      case 1: // Map navigation
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow"
          >
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-aqua-blue to-deep-blue rounded-2xl p-4">
              <Ship className="w-8 h-8 text-white" />
              <div className="flex-1">
                <h3 className="text-white">Navigate the Map!</h3>
                <p className="text-white/90 text-sm">Help Ameer and Ameerah find their way to school</p>
              </div>
            </div>

            <div className="bg-sky-100 rounded-2xl p-8 mb-6">
              <p className="text-deep-blue text-xl mb-4">
                "Here's Ameer and Ameerah's map! They must travel <span className="text-abacus-red">east</span> toward Smart Tech Town, then <span className="text-abacus-red">south</span> to their school, Academia."
              </p>
              <p className="text-deep-blue/80">
                "They must go the right way so they don't end up in Demoniator Dam!"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                onClick={() => {
                  setBoatPath(['east']);
                  setTimeout(() => setStep(2), 500);
                }}
                className="bg-green-500 hover:bg-green-600 text-white py-8 rounded-2xl shadow-lg"
                size="lg"
              >
                <ArrowRight className="w-6 h-6 mr-2" /> Steer East
              </Button>
              <Button
                onClick={() => {
                  setBoatPath(['wrong']);
                }}
                className="bg-gray-400 hover:bg-gray-500 text-white py-8 rounded-2xl shadow-lg"
                size="lg"
              >
                Steer West
              </Button>
            </div>

            {boatPath.includes('wrong') && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-orange-100 border-4 border-orange-400 rounded-2xl p-6 text-center"
              >
                <p className="text-orange-800 text-xl">
                  "Oops! That's the Dam — let's try again!"
                </p>
              </motion.div>
            )}
          </motion.div>
        );

      case 2: // Second navigation
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow"
          >
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4">
              <div className="text-white text-2xl">✓</div>
              <h3 className="text-white">Nice! That's east!</h3>
            </div>

            <div className="bg-sky-100 rounded-2xl p-8 mb-6">
              <p className="text-deep-blue text-xl">
                "Now turn <span className="text-abacus-red">south</span> down the river toward Academia!"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => {
                  setTimeout(() => setStep(3), 500);
                }}
                className="bg-green-500 hover:bg-green-600 text-white py-8 rounded-2xl shadow-lg"
                size="lg"
              >
                ↓ Steer South
              </Button>
              <Button
                onClick={() => {}}
                className="bg-gray-400 hover:bg-gray-500 text-white py-8 rounded-2xl shadow-lg"
                size="lg"
              >
                ↑ Steer North
              </Button>
            </div>
          </motion.div>
        );

      case 3: // Arrival celebration
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                className="text-8xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-deep-blue mb-4">You did it!</h2>
              <p className="text-xl text-deep-blue/80">
                "You navigated the map and avoided the Dam — Great job and smart thinking!"
              </p>
            </div>

            <Button
              onClick={() => setStep(4)}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              size="lg"
            >
              Let's go inside 🚀
            </Button>
          </motion.div>
        );

      case 4: // Emotional choice
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-deep-blue"
          >
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-deep-blue to-aqua-blue rounded-2xl p-4">
              <Volume2 className="w-8 h-8 text-white animate-pulse" />
              <h3 className="text-white">Story Continues...</h3>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-deep-blue text-xl leading-relaxed">
                "Ameer is still worried the math will be too hard at his new school. Ameerah still feels a little brave."
              </p>
              <p className="text-abacus-red text-xl">
                What should they do next?
              </p>
            </div>

            <Button
              onClick={() => setStep(5)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-2xl shadow-xl mb-4"
              size="lg"
            >
              Be brave and go to school ✨
            </Button>

            <div className="bg-aqua-blue/10 rounded-2xl p-4 text-center">
              <p className="text-deep-blue">
                "Being brave doesn't mean you're not scared — it means you still show up."
              </p>
            </div>
          </motion.div>
        );

      case 5: // Meeting Mistress Creola
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow"
          >
            <div className="space-y-6 mb-8">
              <p className="text-deep-blue text-xl leading-relaxed">
                "Ameer and Ameerah park their boat and walk up the steps. They see Mistress Creola smiling at the door."
              </p>

              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 text-center cursor-pointer hover:scale-105 transition-transform">
                <div className="text-6xl mb-4">👋</div>
                <p className="text-purple-900">Tap Mistress Creola to wave hello</p>
              </div>
            </div>

            <Button
              onClick={() => setStep(6)}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              size="lg"
            >
              Wave Hello! 👋
            </Button>
          </motion.div>
        );

      case 6: // Mistress Creola's questions
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-deep-blue"
          >
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4">
              <div className="text-4xl">👩‍🏫</div>
              <h3 className="text-white">Mistress Creola</h3>
            </div>

            <div className="space-y-6 mb-8">
              <p className="text-deep-blue text-xl leading-relaxed">
                "Mistress Creola asks, 'Do you have everything you need for math?'"
              </p>

              <div className="space-y-3">
                <div className="bg-sky-100 rounded-xl p-4 text-center">
                  <p className="text-deep-blue text-xl">Brains? ✓</p>
                </div>
                <div className="bg-green-100 rounded-xl p-4 text-center">
                  <p className="text-deep-blue text-xl">Positive attitude? ✓</p>
                </div>
                <div className="bg-yellow-100 rounded-xl p-4 text-center">
                  <p className="text-deep-blue text-xl">Your special Junior Counter? ✓</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setStep(7)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-6 rounded-2xl shadow-xl"
              size="lg"
            >
              Yes, I have everything! ✨
            </Button>
          </motion.div>
        );

      case 7: // Mistress Creola's wisdom
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow"
          >
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4">
              <div className="text-4xl">👩‍🏫</div>
              <h3 className="text-white">Mistress Creola</h3>
            </div>

            <div className="space-y-6 mb-8">
              <div className="bg-purple-100 rounded-2xl p-6">
                <p className="text-purple-900 text-xl text-center leading-relaxed">
                  "Math is not about being perfect. It's about trying, thinking, and believing in yourself."
                </p>
              </div>

              <p className="text-deep-blue text-xl leading-relaxed">
                "Ameer smiles. 'So we already had everything we needed!'
              </p>
              <p className="text-deep-blue text-xl leading-relaxed">
                Ameerah laughs, 'I guess we're ready!'"
              </p>

              <div className="bg-aqua-blue/10 rounded-2xl p-4">
                <p className="text-deep-blue text-center">
                  Abby: "That's a great reminder for all of us."
                </p>
              </div>
            </div>

            <Button
              onClick={() => setStep(8)}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              size="lg"
            >
              Yes, the twins feel better! 😊
            </Button>
          </motion.div>
        );

      case 8: // Assignment introduction
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-deep-blue"
          >
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-deep-blue to-aqua-blue rounded-2xl p-4">
              <div className="w-12 h-12 bg-sunburst-yellow rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-abacus-red rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-white">Abby</h3>
            </div>

            <div className="space-y-6 mb-8">
              <p className="text-deep-blue text-xl leading-relaxed">
                "Abby says, 'Now that you know you're ready, let's name your junior counter!'"
              </p>

              <div className="bg-sunburst-yellow/20 rounded-2xl p-6">
                <p className="text-deep-blue text-xl text-center">
                  "Today's hard work will be choosing a name for your junior counters."
                </p>
              </div>

              <p className="text-deep-blue text-xl leading-relaxed">
                Ameer felt <span className="text-green-600">relieved</span> when he heard this. Naming his junior counter would be a fun and easy assignment.
              </p>
            </div>

            <Button
              onClick={() => setStep(9)}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              size="lg"
            >
              Let's Name Our Junior Counters! 🎯
            </Button>
          </motion.div>
        );

      case 9: // Meet the classmates
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow"
          >
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-deep-blue to-aqua-blue rounded-2xl p-4">
              <div className="w-12 h-12 bg-sunburst-yellow rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-abacus-red rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white">Abby</h3>
                <p className="text-white/90 text-sm">Your AI Guide</p>
              </div>
              <button className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-all">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-aqua-blue/10 rounded-2xl p-6 mb-8">
              <p className="text-deep-blue text-xl">
                "Listen up, AbaQuester! Your classmates have already named their junior counters. Tap on each friend to hear what they named theirs!"
              </p>
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {avatarFriends.map((friend, index) => (
                <motion.div
                  key={friend.name}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-4 rounded-2xl border-4 border-gray-200 hover:border-sunburst-yellow transition-all duration-300 group cursor-pointer"
                  onClick={() => {
                    // Play audio intro
                    alert(friend.intro);
                  }}
                >
                  {/* Avatar Circle */}
                  <div className={`w-16 h-16 ${friend.color} rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg`}>
                    <div className={`w-8 h-8 ${friend.accent} rounded-full flex items-center justify-center`}>
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-deep-blue text-center text-sm">{friend.name}</p>

                  {/* Audio icon */}
                  <div className="absolute top-2 right-2 bg-abacus-red text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Volume2 className="w-3 h-3" />
                  </div>
                </motion.div>
              ))}
            </div>

            <Button
              onClick={() => setStep(10)}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              size="lg"
            >
              Now It's My Turn! ✨
            </Button>
          </motion.div>
        );

      case 10: // Final naming step
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow"
          >
            <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-deep-blue to-aqua-blue rounded-2xl p-4">
              <div className="w-12 h-12 bg-sunburst-yellow rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-abacus-red rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <h3 className="text-white">Abby</h3>
            </div>

            <div className="bg-aqua-blue/10 rounded-2xl p-6 mb-8">
              <p className="text-deep-blue text-xl text-center">
                "You heard what your friends named their junior counters. Now it's your turn! Tap the name you like best for your junior counter."
              </p>
            </div>

            {/* Avatar Grid for Selection */}
            <div className="grid grid-cols-4 gap-4 mb-8">
              {avatarFriends.map((friend, index) => (
                <motion.div
                  key={friend.name}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative p-4 rounded-2xl border-4 transition-all duration-300 group ${
                    selectedAvatar === friend.name
                      ? 'border-aqua-blue scale-110 shadow-xl'
                      : 'border-gray-200 hover:border-sunburst-yellow'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedAvatar(friend.name);
                      setCustomName('');
                    }}
                    className="w-full"
                  >
                    {/* Avatar Circle */}
                    <div className={`w-16 h-16 ${friend.color} rounded-full mx-auto mb-2 flex items-center justify-center shadow-lg`}>
                      <div className={`w-8 h-8 ${friend.accent} rounded-full flex items-center justify-center`}>
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-deep-blue text-center text-sm">{friend.name}</p>
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Custom Name Input */}
            <div className="mb-8">
              <label className="block text-deep-blue mb-3 text-center">
                Or create your own name:
              </label>
              <Input
                type="text"
                value={customName}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  setSelectedAvatar('');
                }}
                placeholder="Type a special name..."
                className="text-center text-xl py-6 rounded-2xl border-4 border-gray-200 focus:border-aqua-blue"
                maxLength={15}
              />
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirm}
              disabled={!selectedAvatar && !customName}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              Confirm Name ✨
            </Button>

            {(selectedAvatar || customName) && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-6 bg-green-100 border-4 border-green-400 rounded-2xl p-6 text-center"
              >
                <p className="text-green-800 text-xl">
                  "Great name! <span className="text-abacus-red">{customName || selectedAvatar}</span> is ready to go on math quests with you!"
                </p>
                <p className="text-green-700 mt-2">
                  🪙 You earned 2 Quest Coins for getting ready to learn!
                </p>
              </motion.div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen bg-warm-neutral p-8"
    >
      {/* Header with Logo */}
      <div className="flex justify-center mb-6">
        <img src={logo} alt="AbaQuest" className="w-40 h-40 object-cover rounded-full drop-shadow-lg border-4 border-white" />
      </div>

      {/* Story Content */}
      <div className="max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}