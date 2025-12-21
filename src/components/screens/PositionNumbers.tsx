import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, HelpCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useDataLogger } from '../DataLogger';


interface PositionNumbersProps {
  onNext: () => void;
}

type Phase = 'pretest' | 'learn' | 'practice' | 'posttest' | 'story';

export function PositionNumbers({ onNext }: PositionNumbersProps) {
  const [phase, setPhase] = useState<Phase>('pretest');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | 'skip' | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const { logInteraction } = useDataLogger();

  // Pre-test and Post-test questions (MUST BE IDENTICAL)
  const testQuestions = [
    { number: 0, correctPosition: 'top', display: 'Zero' },
    { number: 1, correctPosition: 'middle-lower', display: 'One' },
    { number: 5, correctPosition: 'middle-upper', display: 'Five' },
    { number: 9, correctPosition: 'bottom', display: 'Nine' },
  ];

  useEffect(() => {
    setStartTime(Date.now());
  }, [currentQuestion, phase]);

  const handleAnswer = (answer: string, isSkip: boolean = false) => {
    const currentQ = testQuestions[currentQuestion];
    const isCorrect = !isSkip && answer === currentQ.correctPosition;
    const timeSpent = Date.now() - startTime;

    // Log interaction
    logInteraction({
      quest_id: 3,
      scene_id: `${phase}_question_${currentQuestion + 1}`,
      number: currentQ.number,
      correct_flag: isSkip ? null : isCorrect,
      time_ms: timeSpent,
      interaction_type: phase === 'pretest' ? 'pre_test' : 'post_test',
      student_response: isSkip ? 'I_dont_know_yet' : answer,
    });

    setShowFeedback(isSkip ? 'skip' : (isCorrect ? 'correct' : 'wrong'));

    setTimeout(() => {
      if (currentQuestion < testQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setShowFeedback(null);
      } else {
        // Move to next phase
        if (phase === 'pretest') {
          setPhase('learn');
          setCurrentQuestion(0);
        } else if (phase === 'posttest') {
          setPhase('story');
        }
        setShowFeedback(null);
      }
    }, 1500);
  };

  const renderAbacusPosition = (position: string, isHighlighted: boolean = false) => {
    return (
      <div className="flex flex-col items-center gap-1">
        {/* Top bead (represents 5) */}
        <div
          className={`w-10 h-10 rounded-full transition-all shadow-lg ${position === 'top' && isHighlighted
            ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
            : position === 'top'
              ? 'bg-sunburst-yellow'
              : 'bg-gray-300'
            }`}
        ></div>

        <div className="w-1 h-6 bg-gray-700 rounded"></div>

        {/* Middle-upper beads (5-9) */}
        <div className="flex flex-col gap-1">
          {[0, 1].map((i) => (
            <div
              key={`upper-${i}`}
              className={`w-8 h-8 rounded-full transition-all shadow-lg ${position === 'middle-upper' && isHighlighted
                ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
                : position === 'middle-upper'
                  ? 'bg-sunburst-yellow'
                  : 'bg-gray-400'
                }`}
            ></div>
          ))}
        </div>

        <div className="w-1 h-4 bg-gray-700 rounded"></div>

        {/* Middle-lower beads (1-4) */}
        <div className="flex flex-col gap-1">
          {[0, 1].map((i) => (
            <div
              key={`lower-${i}`}
              className={`w-8 h-8 rounded-full transition-all shadow-lg ${position === 'middle-lower' && isHighlighted
                ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
                : position === 'middle-lower'
                  ? 'bg-sunburst-yellow'
                  : 'bg-gray-400'
                }`}
            ></div>
          ))}
        </div>

        <div className="w-1 h-6 bg-gray-700 rounded"></div>

        {/* Bottom bead (represents 9) */}
        <div
          className={`w-10 h-10 rounded-full transition-all shadow-lg ${position === 'bottom' && isHighlighted
            ? 'bg-abacus-red ring-4 ring-aqua-blue scale-110'
            : position === 'bottom'
              ? 'bg-abacus-red'
              : 'bg-gray-300'
            }`}
        ></div>
      </div>
    );
  };

  // PRE-TEST PHASE
  if (phase === 'pretest' || phase === 'posttest') {
    const currentQ = testQuestions[currentQuestion];
    const isPostTest = phase === 'posttest';

    return (
      <motion.div
        key={phase} // Force remount on phase change
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="min-h-screen bg-warm-neutral p-8"
      >


        <div className="max-w-4xl mx-auto">
          <div className="bg-deep-blue text-white rounded-2xl p-4 mb-4 shadow-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80 mb-1">
                  {isPostTest ? '📝 Post-Test' : '📋 Pre-Test'}
                </p>
                <p className="text-xl">
                  Show me: <span className="text-3xl text-sunburst-yellow ml-2">{currentQ.display}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">Question {currentQuestion + 1} of {testQuestions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-aqua-blue">
            <div className="flex items-center gap-2 mb-6 bg-aqua-blue/10 rounded-xl p-3">
              <div className="text-2xl">🐝</div>
              <p className="text-deep-blue">
                {isPostTest
                  ? "Let's see what you've learned! Click the counter that shows this number."
                  : "No worries if you're not sure yet! Just try your best or skip."}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {['top', 'middle-upper', 'middle-lower', 'bottom'].map((position) => (
                <motion.button
                  key={position}
                  onClick={() => handleAnswer(position)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-50 rounded-xl p-4 border-3 border-gray-200 hover:border-sunburst-yellow transition-all shadow-md"
                >
                  {renderAbacusPosition(position)}
                </motion.button>
              ))}
            </div>

            {/* "I don't know yet" button - only for pre-test */}
            {!isPostTest && (
              <Button
                onClick={() => handleAnswer('', true)}
                variant="outline"
                className="w-full border-2 border-deep-blue/30 text-deep-blue hover:bg-deep-blue/5 py-4 rounded-xl"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                I don't know yet
              </Button>
            )}

            {/* Feedback */}
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
                      <span className="text-xl text-green-700">Great job! 🎉</span>
                    </>
                  ) : showFeedback === 'skip' ? (
                    <>
                      <HelpCircle className="w-8 h-8 text-blue-600" />
                      <span className="text-xl text-blue-700">Thanks for trying! Let's learn together! 📚</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-orange-600" />
                      <span className="text-xl text-orange-700">Keep learning—you'll get it! 💪</span>
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

  // LEARN PHASE - Condensed
  if (phase === 'learn') {
    return (
      <motion.div
        key="learn" // Force remount
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-warm-neutral p-8"
      >


        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-aqua-blue to-deep-blue rounded-2xl p-4 mb-6 shadow-xl text-white">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6" />
              <p className="text-xl">Discovery Time: Where Do Numbers Live?</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-sunburst-yellow">
            <div className="flex items-start gap-4 mb-8 bg-sunburst-yellow/20 rounded-xl p-4">
              <div className="text-4xl">🐝</div>
              <div>
                <p className="text-deep-blue text-xl mb-2">
                  <span className="font-semibold">Abby says:</span> "Each number has its own special home on our Junior Counter! Let's discover them together!"
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Lower Beads: 0-4 */}
              <div className="bg-aqua-blue/10 rounded-xl p-6 border-3 border-aqua-blue">
                <h3 className="text-deep-blue text-center mb-4">🔵 Lower Beads (0-4)</h3>
                <div className="flex justify-center mb-4">
                  {renderAbacusPosition('middle-lower', true)}
                </div>
                <div className="space-y-2 text-deep-blue/80">
                  <p>• <strong>Zero (0)</strong>: All beads away from the bar</p>
                  <p>• <strong>One (1)</strong>: Move 1 lower bead up</p>
                  <p>• <strong>Two-Four</strong>: Add more lower beads</p>
                </div>
              </div>

              {/* Upper Beads: 5-9 */}
              <div className="bg-sunburst-yellow/20 rounded-xl p-6 border-3 border-sunburst-yellow">
                <h3 className="text-deep-blue text-center mb-4">🟡 Upper Beads (5-9)</h3>
                <div className="flex justify-center mb-4">
                  {renderAbacusPosition('middle-upper', true)}
                </div>
                <div className="space-y-2 text-deep-blue/80">
                  <p>• <strong>Five (5)</strong>: Move the top bead down (equals 5!)</p>
                  <p>• <strong>Six-Nine</strong>: Top bead + lower beads</p>
                  <p>• <strong>Nine (9)</strong>: Top bead + all 4 lower beads</p>
                </div>
              </div>
            </div>

            <div className="bg-deep-blue/5 rounded-xl p-4 mb-6">
              <p className="text-deep-blue text-center">
                <strong>💡 Discovery Tip:</strong> The top bead is worth <em>five</em>! Lower beads are worth <em>one</em> each.
              </p>
            </div>

            <Button
              onClick={() => setPhase('practice')}
              className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-5 rounded-xl shadow-xl flex items-center justify-center gap-2"
              size="lg"
            >
              Let's Practice!
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // PRACTICE PHASE - Brief hands-on
  if (phase === 'practice') {
    const practiceNumbers = [1, 5]; // Just 2 quick practice items
    const currentPractice = practiceNumbers[currentQuestion];

    const handlePracticeAnswer = (answer: string) => {
      const correctPosition =
        currentPractice === 1 ? 'middle-lower' : 'middle-upper';
      const isCorrect = answer === correctPosition;
      const timeSpent = Date.now() - startTime;

      logInteraction({
        quest_id: 3,
        scene_id: `practice_${currentPractice}`,
        number: currentPractice,
        correct_flag: isCorrect,
        time_ms: timeSpent,
        interaction_type: 'practice',
        student_response: answer,
      });

      setShowFeedback(isCorrect ? 'correct' : 'wrong');

      setTimeout(() => {
        if (currentQuestion < practiceNumbers.length - 1) {
          setCurrentQuestion(currentQuestion + 1);
          setShowFeedback(null);
        } else {
          setPhase('posttest');
          setCurrentQuestion(0);
          setShowFeedback(null);
        }
      }, 1500);
    };

    return (
      <motion.div
        key="practice" // Force remount
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-warm-neutral p-8"
      >


        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-4 shadow-xl text-white">
            <div className="flex justify-between items-center">
              <p className="text-xl">
                ✨ Practice: Build the number <span className="text-3xl ml-2">{currentPractice}</span>
              </p>
              <p className="text-sm">
                {currentQuestion + 1} of {practiceNumbers.length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-green-500">
            <div className="flex items-center gap-2 mb-6 bg-green-50 rounded-xl p-3">
              <div className="text-2xl">🐝</div>
              <p className="text-deep-blue">
                {currentPractice === 1
                  ? "Remember: One uses a lower bead. Which counter shows this?"
                  : "Remember: Five uses the special top bead! Which one is it?"}
              </p>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {['top', 'middle-upper', 'middle-lower', 'bottom'].map((position) => (
                <motion.button
                  key={position}
                  onClick={() => handlePracticeAnswer(position)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-50 rounded-xl p-4 border-3 border-gray-200 hover:border-green-500 transition-all shadow-md"
                >
                  {renderAbacusPosition(position)}
                </motion.button>
              ))}
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
                      <span className="text-xl text-green-700">Perfect! You're getting it! 🌟</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-orange-600" />
                      <span className="text-xl text-orange-700">Almost! Try again next time! 💪</span>
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

  // STORY MODE - Focused interactions
  if (phase === 'story') {
    const [storyStep, setStoryStep] = useState(0);

    const storyScenes = [
      {
        narrator: "In Mistress Creola's class, students are learning number positions...",
        character: '👦',
        characterName: 'Ameer',
        problem: "Ameer tried to show the number 5 but used the wrong beads.",
        question: "Help Ameer: Which beads should he use for 5?",
        correctAnswer: 'middle-upper',
        number: 5,
      },
      {
        narrator: "Ameerah is working on the number 1...",
        character: '👧',
        characterName: 'Ameerah',
        problem: "Ameerah isn't sure if 1 uses the top bead or a lower bead.",
        question: "Help Ameerah: Which beads show the number 1?",
        correctAnswer: 'middle-lower',
        number: 1,
      },
    ];

    const currentStory = storyScenes[storyStep];

    const handleStoryAnswer = (answer: string) => {
      const isCorrect = answer === currentStory.correctAnswer;
      const timeSpent = Date.now() - startTime;

      logInteraction({
        quest_id: 3,
        scene_id: `story_scene_${storyStep + 1}`,
        number: currentStory.number,
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
          onNext();
        }
      }, 2000);
    };

    return (
      <motion.div
        key="story" // Force remount
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-purple-100 via-warm-neutral to-pink-100 p-8"
      >


        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-deep-blue">
            <h2 className="text-deep-blue text-center mb-6">📖 Story Time with Mistress Creola</h2>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
              <p className="text-deep-blue/80 text-lg mb-4">{currentStory.narrator}</p>

              <div className="flex items-center gap-4 mb-4 bg-white rounded-lg p-4 shadow">
                <div className="text-5xl">{currentStory.character}</div>
                <div>
                  <p className="text-deep-blue">{currentStory.characterName}</p>
                  <p className="text-deep-blue/70 text-sm">{currentStory.problem}</p>
                </div>
              </div>

              <div className="bg-aqua-blue/20 rounded-lg p-4 border-2 border-aqua-blue">
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-2xl">🐝</div>
                  <p className="text-deep-blue">
                    <strong>Abby prompts you:</strong>
                  </p>
                </div>
                <p className="text-deep-blue text-lg">{currentStory.question}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-6">
              {['top', 'middle-upper', 'middle-lower', 'bottom'].map((position) => (
                <motion.button
                  key={position}
                  onClick={() => handleStoryAnswer(position)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gray-50 rounded-xl p-4 border-3 border-gray-200 hover:border-deep-blue transition-all shadow-md"
                >
                  {renderAbacusPosition(position)}
                </motion.button>
              ))}
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

  return null;
}