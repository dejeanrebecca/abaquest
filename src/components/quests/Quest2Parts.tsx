import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { QuestWelcome } from '../quest-screens/QuestWelcome';
import { QuestClose } from '../quest-screens/QuestClose';
import { Button } from '../ui/button';
import { AudioNarration } from '../AudioNarration';
import { JuniorCounter } from '../JuniorCounter';
import { useDataLogger } from '../DataLogger';
import { useQuestEngine } from '../QuestEngine';
import { HelpCircle, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

interface Quest2PartsProps {
  onComplete: () => void;
}

type Step = 'welcome' | 'pretest' | 'learn' | 'story' | 'posttest' | 'close';
type Part = 'upper' | 'lower' | 'rod';

export function Quest2Parts({ onComplete }: Quest2PartsProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'skip' | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [preTestAnswers, setPreTestAnswers] = useState<boolean[]>([]);
  const [postTestAnswers, setPostTestAnswers] = useState<boolean[]>([]);
  const [storyStep, setStoryStep] = useState(0);
  const [showPreTestIntro, setShowPreTestIntro] = useState(true);

  const { logInteraction } = useDataLogger();
  const { completeQuest } = useQuestEngine();

  // Pre-test and Post-test questions (IDENTICAL - parts identification)
  const testQuestions: Array<{ part: Part; question: string }> = [
    { part: 'upper', question: 'Which part is the Upper Bead (Head)?' },
    { part: 'lower', question: 'Which part are the Lower Beads (Legs)?' },
    { part: 'rod', question: 'Which part is the Answer Rod (Body)?' },
  ];

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestion, step]);

  const calculateScore = (answers: boolean[]): number => {
    if (answers.length === 0) return 0;
    const correct = answers.filter(a => a).length;
    return Math.round((correct / answers.length) * 100);
  };

  // STEP 1: WELCOME
  if (step === 'welcome') {
    return (
      <QuestWelcome
        questTitle="Quest 2: Parts of the Counter"
        questIcon="🧩"
        welcomeMessage="Great work so far, AbaQuester! Now that you've named your Junior Counter, it's time to learn about its special parts. Every part has a job to do — and they all work together to help you think about numbers!"
        onNext={() => setStep('pretest')}
        showEmotionalCheckIn={false}
      />
    );
  }

  // STEP 2: PRE-TEST
  if (step === 'pretest') {
    if (showPreTestIntro) {
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-warm-neutral p-8">
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
                text="Before we explore the parts, let's see what you already know. Remember: You can always say 'I don't know yet' — that's how we learn!"
                speaker="abby"
                autoPlay
              />

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

    const handleAnswer = (answer: Part | 'skip') => {
      const timeSpent = Date.now() - startTime;
      const isCorrect = answer === currentQ.part;

      logInteraction({
        quest_id: 2,
        scene_id: `pretest_${currentQ.part}`,
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-warm-neutral p-8">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-deep-blue text-white rounded-2xl p-4 mb-4 shadow-xl">
            <p className="text-xl">📋 Pre-Test: Question {currentQuestion + 1} of {testQuestions.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-aqua-blue">
            <AudioNarration text={currentQ.question} speaker="abby" compact />

            <div className="my-8 flex justify-center">
              <JuniorCounter interactive={false} size="large" />
            </div>

            <p className="text-center text-xl text-deep-blue mb-6">{currentQ.question}</p>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Button
                onClick={() => handleAnswer('upper')}
                className="bg-abacus-red hover:bg-abacus-red/90 text-white py-8 rounded-2xl shadow-lg"
              >
                Upper Bead
              </Button>
              <Button
                onClick={() => handleAnswer('lower')}
                className="bg-aqua-blue hover:bg-aqua-blue/90 text-white py-8 rounded-2xl shadow-lg"
              >
                Lower Beads
              </Button>
              <Button
                onClick={() => handleAnswer('rod')}
                className="bg-gray-700 hover:bg-gray-800 text-white py-8 rounded-2xl shadow-lg"
              >
                Answer Rod
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
                      <span className="text-xl text-orange-700">Keep trying! 💪</span>
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

  // STEP 3: MINI-LESSON (Guided Practice)
  if (step === 'learn') {
    const [currentPart, setCurrentPart] = useState<Part | null>(null);
    const [completedParts, setCompletedParts] = useState<Part[]>([]);

    const parts: Array<{ part: Part; name: string; description: string; color: string }> = [
      {
        part: 'upper',
        name: 'Upper Bead (Head)',
        description: "This special bead is worth FIVE! It is like the head of your counter.",
        color: 'from-abacus-red to-red-700',
      },
      {
        part: 'lower',
        name: 'Lower Beads (Legs)',
        description: 'These four beads are each worth ONE. They are like the legs that help you count!',
        color: 'from-aqua-blue to-blue-600',
      },
      {
        part: 'rod',
        name: 'Answer Rod (Body)',
        description: 'This rod holds everything together — like the body connects the head and legs!',
        color: 'from-gray-700 to-gray-900',
      },
    ];

    const handlePartClick = (part: Part) => {
      setCurrentPart(part);
      if (!completedParts.includes(part)) {
        setCompletedParts(prev => [...prev, part]);
      }
    };

    const isComplete = completedParts.length === 3;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-warm-neutral p-8">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-aqua-blue to-deep-blue rounded-2xl p-4 mb-6 shadow-xl text-white">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-center flex-1">Discovery Time: Three Special Parts!</h2>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-sunburst-yellow">
            <AudioNarration
              text="Your Junior Counter has three main parts, and each one has a special name and job. Tap on each part to learn about it!"
              speaker="abby"
              autoPlay={completedParts.length === 0}
            />

            <div className="my-8 flex justify-center">
              <JuniorCounter
                interactive={false}
                size="large"
                highlightPart={currentPart}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {parts.map(p => (
                <button
                  key={p.part}
                  onClick={() => handlePartClick(p.part)}
                  className={`p-6 rounded-2xl border-4 transition-all ${currentPart === p.part
                      ? 'border-sunburst-yellow bg-sunburst-yellow/10 scale-105'
                      : completedParts.includes(p.part)
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-200 hover:border-aqua-blue'
                    }`}
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${p.color} mx-auto mb-2`}></div>
                  <p className="text-deep-blue font-semibold">{p.name}</p>
                  {completedParts.includes(p.part) && <p className="text-green-600 text-sm mt-1">✓ Learned!</p>}
                </button>
              ))}
            </div>

            {currentPart && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-aqua-blue/10 to-deep-blue/10 rounded-2xl p-6 mb-6"
              >
                <h3 className="text-deep-blue mb-2">
                  {parts.find(p => p.part === currentPart)?.name}
                </h3>
                <p className="text-deep-blue/80">
                  {parts.find(p => p.part === currentPart)?.description}
                </p>
              </motion.div>
            )}

            {isComplete && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                <Button
                  onClick={() => setStep('story')}
                  className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl"
                  size="lg"
                >
                  I Know the Parts! Let's Continue! ✨
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // STEP 4: STORY MODE
  if (step === 'story') {
    const storyScenes = [
      {
        narrator: "In Mistress Creola's class, students are learning about the parts of their Junior Counters...",
        character: '👦',
        characterName: 'Ameer',
        problem: 'Ameer forgot which bead is worth five.',
        question: 'Help Ameer: Which part is worth FIVE?',
        correctAnswer: 'upper' as Part,
      },
      {
        narrator: "Ameerah is trying to remember the names of all the parts...",
        character: '👧',
        characterName: 'Ameerah',
        problem: "Ameerah can't remember what holds all the beads together.",
        question: 'Help Ameerah: Which part holds everything together?',
        correctAnswer: 'rod' as Part,
      },
    ];

    const currentStory = storyScenes[storyStep];

    const handleStoryAnswer = (answer: Part) => {
      const isCorrect = answer === currentStory.correctAnswer;
      const timeSpent = Date.now() - startTime;

      logInteraction({
        quest_id: 2,
        scene_id: `story_scene_${storyStep + 1}`,
        number: null,
        correct_flag: isCorrect,
        time_ms: timeSpent,
        interaction_type: 'story',
        student_response: answer,
      });

      setShowFeedback(isCorrect ? 'correct' : 'wrong');

      setTimeout(() => {
        if (storyStep < storyScenes.length - 1) {
          setStoryStep(storyStep + 1);
          setShowFeedback(null);
        } else {
          setStep('posttest');
          setCurrentQuestion(0);
          setShowFeedback(null);
        }
      }, 2000);
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-100 via-warm-neutral to-pink-100 p-8"
      >
        <div className="flex justify-center mb-4">
          <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-deep-blue">
            <h2 className="text-deep-blue text-center mb-6">📖 Story Time with Mistress Creola</h2>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <p className="text-deep-blue/80 text-lg mb-4">{currentStory.narrator}</p>

              <div className="flex items-center gap-4 mb-4 bg-white rounded-lg p-4 shadow">
                <div className="text-5xl">{currentStory.character}</div>
                <div>
                  <p className="text-deep-blue font-semibold">{currentStory.characterName}</p>
                  <p className="text-deep-blue/70 text-sm">{currentStory.problem}</p>
                </div>
              </div>

              <AudioNarration
                text={currentStory.question}
                speaker="abby"
                compact
              />
            </div>

            <div className="flex justify-center mb-6">
              <JuniorCounter interactive={false} size="large" />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <Button
                onClick={() => handleStoryAnswer('upper')}
                className="bg-abacus-red hover:bg-abacus-red/90 text-white py-8 rounded-2xl shadow-lg"
              >
                Upper Bead
              </Button>
              <Button
                onClick={() => handleStoryAnswer('lower')}
                className="bg-aqua-blue hover:bg-aqua-blue/90 text-white py-8 rounded-2xl shadow-lg"
              >
                Lower Beads
              </Button>
              <Button
                onClick={() => handleStoryAnswer('rod')}
                className="bg-gray-700 hover:bg-gray-800 text-white py-8 rounded-2xl shadow-lg"
              >
                Answer Rod
              </Button>
            </div>

            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0, y: 20 }}
                  className={`p-4 rounded-xl flex items-center justify-center gap-3 ${showFeedback === 'correct'
                      ? 'bg-green-100 border-3 border-green-500'
                      : 'bg-orange-100 border-3 border-orange-400'
                    }`}
                >
                  {showFeedback === 'correct' ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <span className="text-xl text-green-700">
                        Perfect! {currentStory.characterName} learned from you! 🎉
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-orange-600" />
                      <span className="text-xl text-orange-700">
                        Good try! {currentStory.characterName} will keep practicing! 💪
                      </span>
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

  // STEP 5: POST-TEST (Same questions as pre-test)
  if (step === 'posttest') {
    const currentQ = testQuestions[currentQuestion];

    const handleAnswer = (answer: Part) => {
      const timeSpent = Date.now() - startTime;
      const isCorrect = answer === currentQ.part;

      logInteraction({
        quest_id: 2,
        scene_id: `posttest_${currentQ.part}`,
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-warm-neutral p-8">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="AbaQuest" className="w-32 h-32 object-cover rounded-full drop-shadow-lg border-4 border-white" />
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-4 shadow-xl text-white">
            <p className="text-xl">✅ Post-Test: Question {currentQuestion + 1} of {testQuestions.length}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-500">
            <AudioNarration
              text="Let's see what you've learned about the parts of the Junior Counter!"
              speaker="abby"
              compact
            />

            <div className="my-8 flex justify-center">
              <JuniorCounter interactive={false} size="large" />
            </div>

            <p className="text-center text-xl text-deep-blue mb-6">{currentQ.question}</p>

            <div className="grid grid-cols-3 gap-4">
              <Button
                onClick={() => handleAnswer('upper')}
                className="bg-abacus-red hover:bg-abacus-red/90 text-white py-8 rounded-2xl shadow-lg"
              >
                Upper Bead
              </Button>
              <Button
                onClick={() => handleAnswer('lower')}
                className="bg-aqua-blue hover:bg-aqua-blue/90 text-white py-8 rounded-2xl shadow-lg"
              >
                Lower Beads
              </Button>
              <Button
                onClick={() => handleAnswer('rod')}
                className="bg-gray-700 hover:bg-gray-800 text-white py-8 rounded-2xl shadow-lg"
              >
                Answer Rod
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
        questTitle="Quest 2: Parts of the Counter"
        questIcon="🧩"
        preTestScore={preTestScore}
        postTestScore={postTestScore}
        coinsEarned={25}
        learningGain={learningGain}
        summary="You've mastered the three parts of your Junior Counter: the Upper Bead (Head), Lower Beads (Legs), and Answer Rod (Body)! Now you're ready to learn how numbers live on your counter!"
        onNext={() => {
          completeQuest(preTestScore, postTestScore);
          onComplete();
        }}
      />
    );
  }

  return null;
}