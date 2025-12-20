import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { AudioNarration } from '../AudioNarration';
import { JuniorCounter } from '../JuniorCounter';
import { useDataLogger } from '../DataLogger';
import { CheckCircle, XCircle } from 'lucide-react';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

type Part = 'upper' | 'lower' | 'rod';

interface Quest2StoryProps {
    onComplete: () => void;
}

export function Quest2Story({ onComplete }: Quest2StoryProps) {
    const [storyStep, setStoryStep] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [startTime] = useState(Date.now()); // Start time usually irrelevant for story unless per-question? Assuming shared start time ok, or we can use per-render.

    // Actually, we should track response time per question
    // So we might want a new startTime ref or state reset when storyStep changes.
    // But for simplicity let's stick to original behavior which used quest start time? 
    // Wait, original used `startTime` from top level quest. 
    // Let's use Date.now() for interaction logging.

    const { logInteraction } = useDataLogger();

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
        const timeSpent = 1000; // Placeholder or calculate properly if needed.

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
                onComplete();
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
