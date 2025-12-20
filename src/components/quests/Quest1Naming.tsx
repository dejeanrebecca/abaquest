import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestWelcome } from '../quest-screens/QuestWelcome';
import { QuestClose } from '../quest-screens/QuestClose';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { AudioNarration } from '../AudioNarration';
import { JuniorCounter } from '../JuniorCounter';
import { useDataLogger } from '../DataLogger';
import { useQuestEngine } from '../QuestEngine';
import { HelpCircle, CheckCircle, XCircle, Ship, ArrowRight, Volume2 } from 'lucide-react';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

interface Quest1NamingProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'pretest' | 'learn' | 'story' | 'posttest' | 'close';

export function Quest1Naming({ onComplete }: Quest1NamingProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'skip' | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [preTestAnswers, setPreTestAnswers] = useState<boolean[]>([]);
  const [postTestAnswers, setPostTestAnswers] = useState<boolean[]>([]);
  const [counterName, setCounterName] = useState('');
  const [storyStep, setStoryStep] = useState(0);
  const [showPreTestIntro, setShowPreTestIntro] = useState(true);
  const [navComplete, setNavComplete] = useState(false);

  const { logInteraction } = useDataLogger();
  const { setEmotionalState, setStudentName, completeQuest } = useQuestEngine();

  // Pre-test and Post-test questions (MUST BE IDENTICAL)
  const testQuestions = [
    { question: 'Can you point to something that counts?', type: 'recognition' },
    { question: 'Do you know what an abacus is?', type: 'knowledge' },
    { question: 'Can you name a tool that helps with math?', type: 'recall' },
  ];

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestion, step]);

  // Complete quest logic moved to close step interaction

  const calculateScore = (answers: boolean[]): number => {
    if (answers.length === 0) return 0;
    const correct = answers.filter(a => a).length;
    return Math.round((correct / answers.length) * 100);
  };

  // STEP 1: WELCOME
  if (step === 'welcome') {
    return (
      <QuestWelcome
        questTitle="Quest 1: The Naming"
        questIcon="✏️"
        welcomeMessage="Welcome, young AbaQuester! I'm so happy you're here. Today, you're joining a very special place — Mistress Creola's School of Mental Math! It's a magical school where numbers come alive, and every student learns to use their Junior Counter to solve puzzles and explore new worlds."
        onNext={() => setStep('pretest')}
        onEmotionalCheckIn={setEmotionalState}
        showEmotionalCheckIn={true}
      />
    );
  }

  // STEP 2: PRE-TEST
  if (step === 'pretest') {
    if (showPreTestIntro) {
      // Pre-test intro
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-warm-neutral p-8"
        >
          <div className="flex justify-center mb-4">
            <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-aqua-blue">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-deep-blue mb-4">Pre-Test</h2>
              </div>

              <AudioNarration
                text="Before we begin our adventure, I want to see what you already know. Don't worry if you're not sure about the answers! You can always click 'I don't know yet' — that's totally okay!"
                speaker="abby"
                autoPlay
              />

              <div className="mt-8 bg-aqua-blue/10 rounded-2xl p-6 border-2 border-aqua-blue">
                <p className="text-deep-blue text-center">
                  Remember: This is just to help Abby know where to start. There are no wrong answers! 💙
                </p>
              </div>

              <Button
                onClick={() => setShowPreTestIntro(false)}
                className="w-full mt-8 bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
                size="lg"
              >
                I'm Ready! 🚀
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    const currentQ = testQuestions[currentQuestion];

    const handleAnswer = (answer: 'yes' | 'no' | 'skip') => {
      const timeSpent = Date.now() - startTime;
      const isCorrect = answer === 'yes'; // For this Quest, "yes" is generally correct

      logInteraction({
        quest_id: 1,
        scene_id: `pretest_q${currentQuestion + 1}`,
        number: null,
        correct_flag: answer === 'skip' ? null : isCorrect,
        time_ms: timeSpent,
        interaction_type: 'pre_test',
        student_response: answer,
      });

      setPreTestAnswers(prev => [...prev, isCorrect]);
      setShowFeedback(answer === 'skip' ? 'skip' : isCorrect ? 'correct' : 'wrong');

      setTimeout(() => {
        if (currentQuestion < testQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setShowFeedback(null);
        } else {
          setStep('learn');
          setCurrentQuestion(0);
          setShowFeedback(null);
        }
      }, 1500);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-warm-neutral p-8"
      >
        <div className="flex justify-center mb-4">
          <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-deep-blue text-white rounded-2xl p-4 mb-4 shadow-xl">
            <div className="flex justify-between items-center">
              <p className="text-xl">📋 Pre-Test Question {currentQuestion + 1} of {testQuestions.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-aqua-blue">
            <AudioNarration text={currentQ.question} speaker="abby" compact />

            <div className="my-8 text-center">
              <p className="text-2xl text-deep-blue">{currentQ.question}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <Button
                onClick={() => handleAnswer('yes')}
                className="bg-green-500 hover:bg-green-600 text-white py-8 rounded-2xl shadow-lg text-xl"
                size="lg"
              >
                ✓ Yes
              </Button>
              <Button
                onClick={() => handleAnswer('no')}
                className="bg-orange-400 hover:bg-orange-500 text-white py-8 rounded-2xl shadow-lg text-xl"
                size="lg"
              >
                ✗ No
              </Button>
            </div>

            <Button
              onClick={() => handleAnswer('skip')}
              variant="outline"
              className="w-full border-2 border-deep-blue/30 text-deep-blue hover:bg-deep-blue/5 py-4 rounded-xl"
            >
              <HelpCircle className="w-5 h-5 mr-2" />
              I don't know yet
            </Button>

            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: 20 }}
                  className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 ${showFeedback === 'correct'
                      ? 'bg-green-100 border-3 border-green-500'
                      : showFeedback === 'skip'
                        ? 'bg-blue-100 border-3 border-blue-400'
                        : 'bg-orange-100 border-3 border-orange-400'
                    }`}
                >
                  {showFeedback === 'correct' ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <span className="text-xl text-green-700">Great! 🎉</span>
                    </>
                  ) : showFeedback === 'skip' ? (
                    <>
                      <HelpCircle className="w-8 h-8 text-blue-600" />
                      <span className="text-xl text-blue-700">That's okay! Let's learn together! 📚</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-orange-600" />
                      <span className="text-xl text-orange-700">No worries! You'll learn soon! 💪</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // STEP 3: MINI-LESSON
  if (step === 'learn') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-warm-neutral p-8"
      >
        <div className="flex justify-center mb-4">
          <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-sunburst-yellow to-orange-400 rounded-2xl p-4 mb-6 shadow-xl text-white">
            <h2 className="text-center">📚 Discovery: Meet Your Junior Counter!</h2>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-deep-blue">
            <AudioNarration
              text="This is your Junior Counter! It's a special tool that helps you think about numbers. At our school, every student names their Junior Counter — just like you'd name a friend or a pet. Your counter will go on every adventure with you!"
              speaker="abby"
              autoPlay
            />

            <div className="my-8 flex justify-center">
              <JuniorCounter
                interactive={false}
                size="large"
                showValue={false}
              />
            </div>

            <div className="bg-gradient-to-r from-aqua-blue/10 to-deep-blue/10 rounded-2xl p-6 mb-6">
              <p className="text-deep-blue text-lg text-center">
                💡 <strong>Fun Fact:</strong> The Junior Counter has special parts that you'll learn about in the next quest. For now, let's give it a name!
              </p>
            </div>

            <Button
              onClick={() => {
                setStep('story');
                setStoryStep(5); // Skip directly to naming scene
              }}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              size="lg"
            >
              Let's Name It! ✨
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // STEP 4: STORY MODE (The existing NameCounter story)
  if (step === 'story') {
    // Condensed story version for Quest 1
    const storyScenes = [
      {
        type: 'narration',
        content: "It was the twins' first day at the School of Mental Math. Ameerah was curious about who her new friends would be. Ameer hoped the math wouldn't be too hard, he was nervous.",
      },
      {
        type: 'navigation',
        content: "Help Ameer and Ameerah navigate their boat to school!",
      },
      {
        type: 'arrival',
        content: "You did it! They navigated to Academia!",
      },
      {
        type: 'mistress-creola',
        content: "Mistress Creola asks: 'Do you have everything you need for math? Brains? ✓ Positive attitude? ✓ Your Junior Counter? ✓'",
      },
      {
        type: 'classmates',
        content: "Meet your classmates! They've already named their Junior Counters.",
      },
      {
        type: 'naming',
        content: "Now it's YOUR turn to name your Junior Counter!",
      },
    ];

    const currentScene = storyScenes[storyStep];

    // Navigation scene
    if (currentScene.type === 'navigation') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-gradient-to-b from-sky-200 to-warm-neutral p-8"
        >
          <div className="flex justify-center mb-4">
            <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow">
              <div className="flex items-center gap-4 mb-6 bg-gradient-to-r from-aqua-blue to-deep-blue rounded-2xl p-4">
                <Ship className="w-8 h-8 text-white" />
                <h3 className="text-white">Navigate the Map!</h3>
              </div>

              <AudioNarration
                text="Ameer and Ameerah must travel east toward Smart Tech Town, then south to their school, Academia. Help them steer the right way!"
                speaker="narrator"
                compact
              />

              <div className="my-6">
                <p className="text-deep-blue text-center mb-4">Which way should they go first?</p>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => {
                      setNavComplete(true);
                      setTimeout(() => setStoryStep(storyStep + 1), 1500);
                    }}
                    className="bg-green-500 hover:bg-green-600 text-white py-8 rounded-2xl shadow-lg"
                    disabled={navComplete}
                  >
                    <ArrowRight className="w-6 h-6 mr-2" /> Steer East ✓
                  </Button>
                  <Button
                    className="bg-gray-400 text-white py-8 rounded-2xl shadow-lg cursor-not-allowed"
                    disabled
                  >
                    Steer West
                  </Button>
                </div>

                {navComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-4 bg-green-100 border-4 border-green-500 rounded-2xl p-4 text-center"
                  >
                    <p className="text-green-800 text-xl">🎉 Perfect! That's the right way!</p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Classmates scene
    if (currentScene.type === 'classmates') {
      const classmates = [
        { name: 'Coco', color: 'bg-orange-400', intro: "Hi! I'm Coco. I love counting!" },
        { name: 'Nova', color: 'bg-purple-400', intro: "Hey! I'm Nova. Math is fun!" },
        { name: 'Bolt', color: 'bg-yellow-400', intro: "Yo! I'm Bolt. I'm super fast!" },
        { name: 'Zippy', color: 'bg-green-400', intro: "Hi! I'm Zippy!" },
      ];

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-warm-neutral p-8"
        >
          <div className="flex justify-center mb-4">
            <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow">
              <AudioNarration
                text="Your classmates have already named their junior counters. Tap on each friend to hear what they named theirs!"
                speaker="abby"
                compact
              />

              <div className="grid grid-cols-4 gap-4 my-8">
                {classmates.map((friend, index) => (
                  <motion.div
                    key={friend.name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-2xl border-4 border-gray-200 hover:border-sunburst-yellow transition-all cursor-pointer text-center"
                  >
                    <div className={`w-16 h-16 ${friend.color} rounded-full mx-auto mb-2`}></div>
                    <p className="text-deep-blue">{friend.name}</p>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={() => setStoryStep(storyStep + 1)}
                className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              >
                Now It's My Turn! ✨
              </Button>
            </div>
          </div>
        </motion.div>
      );
    }

    // Naming scene
    if (currentScene.type === 'naming') {
      const suggestedNames = ['Coco', 'Nova', 'Bolt', 'Zippy', 'Spark', 'Luna'];

      const handleConfirm = () => {
        const finalName = counterName;
        if (finalName) {
          setStudentName(finalName);
          setStep('posttest');
        }
      };

      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-warm-neutral p-8"
        >
          <div className="flex justify-center mb-4">
            <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow">
              <AudioNarration
                text="You heard what your friends named their junior counters. Now it's your turn! Choose a name you like or create your own special name."
                speaker="abby"
                compact
              />

              <div className="my-8">
                <p className="text-center text-deep-blue mb-4">Choose a name:</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {suggestedNames.map(name => (
                    <button
                      key={name}
                      onClick={() => {
                        setCounterName(name);
                      }}
                      className={`p-4 rounded-xl border-4 transition-all ${counterName === name
                          ? 'border-aqua-blue bg-aqua-blue/10 scale-105'
                          : 'border-gray-200 hover:border-sunburst-yellow'
                        }`}
                    >
                      <p className="text-deep-blue">{name}</p>
                    </button>
                  ))}
                </div>

                <div className="mb-6">
                  <label className="block text-deep-blue mb-3 text-center">
                    Or create your own name:
                  </label>
                  <Input
                    type="text"
                    value={counterName}
                    onChange={(e) => {
                      setCounterName(e.target.value);
                    }}
                    placeholder="Type a special name..."
                    className="text-center text-xl py-6 rounded-2xl border-4 border-gray-200 focus:border-aqua-blue"
                    maxLength={15}
                  />
                </div>

                <Button
                  onClick={handleConfirm}
                  disabled={!counterName}
                  className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl disabled:opacity-50"
                >
                  Confirm Name ✨
                </Button>

                {counterName && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-6 bg-green-100 border-4 border-green-400 rounded-2xl p-6 text-center"
                  >
                    <p className="text-green-800 text-xl">
                      Great name! <span className="text-abacus-red font-bold">{counterName}</span> is ready for math quests!
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    // Default story narration
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-purple-100 to-warm-neutral p-8"
      >
        <div className="flex justify-center mb-4">
          <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-deep-blue">
            <h2 className="text-deep-blue text-center mb-6">📖 Story Time</h2>

            <AudioNarration text={currentScene.content} speaker="narrator" autoPlay />

            <div className="mt-8">
              <Button
                onClick={() => setStoryStep(storyStep + 1)}
                className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // STEP 5: POST-TEST (Same questions as pre-test)
  if (step === 'posttest') {
    const currentQ = testQuestions[currentQuestion];

    const handleAnswer = (answer: 'yes' | 'no') => {
      const timeSpent = Date.now() - startTime;
      const isCorrect = answer === 'yes';

      logInteraction({
        quest_id: 1,
        scene_id: `posttest_q${currentQuestion + 1}`,
        number: null,
        correct_flag: isCorrect,
        time_ms: timeSpent,
        interaction_type: 'post_test',
        student_response: answer,
      });

      setPostTestAnswers(prev => [...prev, isCorrect]);
      setShowFeedback(isCorrect ? 'correct' : 'wrong');

      setTimeout(() => {
        if (currentQuestion < testQuestions.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setShowFeedback(null);
        } else {
          setStep('close');
        }
      }, 1500);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-warm-neutral p-8"
      >
        <div className="flex justify-center mb-4">
          <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-4 shadow-xl text-white">
            <div className="flex justify-between items-center">
              <p className="text-xl">✅ Post-Test Question {currentQuestion + 1} of {testQuestions.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-500">
            <AudioNarration
              text="Let's see what you've learned! Answer these questions — I know you can do it!"
              speaker="abby"
              compact
            />

            <div className="my-8 text-center">
              <p className="text-2xl text-deep-blue">{currentQ.question}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleAnswer('yes')}
                className="bg-green-500 hover:bg-green-600 text-white py-8 rounded-2xl shadow-lg text-xl"
                size="lg"
              >
                ✓ Yes
              </Button>
              <Button
                onClick={() => handleAnswer('no')}
                className="bg-orange-400 hover:bg-orange-500 text-white py-8 rounded-2xl shadow-lg text-xl"
                size="lg"
              >
                ✗ No
              </Button>
            </div>

            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: 20 }}
                  className={`mt-6 p-4 rounded-xl flex items-center justify-center gap-3 ${showFeedback === 'correct'
                      ? 'bg-green-100 border-3 border-green-500'
                      : 'bg-orange-100 border-3 border-orange-400'
                    }`}
                >
                  {showFeedback === 'correct' ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <span className="text-xl text-green-700">Perfect! 🌟</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-orange-600" />
                      <span className="text-xl text-orange-700">Keep learning! 💪</span>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  }

  // STEP 6: CLOSE
  if (step === 'close') {
    const preTestScore = calculateScore(preTestAnswers);
    const postTestScore = calculateScore(postTestAnswers);
    const learningGain = postTestScore - preTestScore;

    return (
      <QuestClose
        questTitle="Quest 1: The Naming"
        questIcon="✏️"
        preTestScore={preTestScore}
        postTestScore={postTestScore}
        coinsEarned={20}
        learningGain={learningGain}
        summary={`You named your Junior Counter "${counterName}" and learned that it's a special tool for thinking about math! You're now an official student at Mistress Creola's School of Mental Math!`}
        onNext={() => {
          completeQuest(preTestScore, postTestScore);
          onComplete();
        }}
      />
    );
  }

  return null;
}