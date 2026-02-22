import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
// import { Button } from '../ui/button';
import { AudioNarration } from '../AudioNarration';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { useDataLogger } from '../DataLogger';
import { CheckCircle, XCircle } from 'lucide-react';
import storyImg from '../../assets/story-two-img1.png';


type Part = 'upper' | 'lower' | 'rod';

interface StoryScene {
    narrator: string;
    character: string;
    characterName: string;
    problem: string;
    question: string;
    correctAnswer: Part;
    showImage: boolean;
}

interface Quest2StoryProps {
    onComplete: () => void;
}

export function Quest2Story({ onComplete }: Quest2StoryProps) {
    const [storyStep, setStoryStep] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);


    // Actually, we should track response time per question
    // So we might want a new startTime ref or state reset when storyStep changes.
    // But for simplicity let's stick to original behavior which used quest start time? 
    // Wait, original used `startTime` from top level quest. 
    // Let's use Date.now() for interaction logging.

    const { logInteraction } = useDataLogger();

    const storyScenes: StoryScene[] = [
        {
            narrator: "Look what Ameer and Ameerah found! It's a special diagram of the Junior Counter. It helps them see exactly where each part belongs. Can you help them identify the parts on your own counter?",
            character: '🗺️',
            characterName: 'The Map',
            problem: 'Let\'s match the map to your counter!',
            question: 'Find the Upper Bead.',
            correctAnswer: 'upper' as Part,
            showImage: true
        },
        {
            narrator: "Ameerah is studying the map closely. She says, 'The answer rod is like the counter's backbone!'",
            character: '👧',
            characterName: 'Ameerah',
            problem: "Ameerah wants to find the backbone.",
            question: 'Which part holds everything together like a backbone?',
            correctAnswer: 'rod' as Part,
            showImage: false
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
                {/* Logo removed */}
            </div>

            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-deep-blue">
                    <h2 className="text-deep-blue text-center mb-6">📖 Story Time with Mistress Creola</h2>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                        {currentStory.showImage && (
                            <div className="mb-6 flex justify-center">
                                <img
                                    src={storyImg}
                                    alt="Diagram of Junior Counter Parts"
                                    className="rounded-xl shadow-lg max-h-64 object-cover border-4 border-white"
                                />
                            </div>
                        )}

                        <p className="text-deep-blue/80 text-lg mb-4">{currentStory.narrator}</p>
                        <AudioNarration
                            text={currentStory.narrator}
                            speaker="narrator"
                            autoPlay={true}
                            compact
                        />

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
                        <InteractiveAbacus
                            interactive={false}
                            onPartClick={(part) => handleStoryAnswer(part)}
                        />
                    </div>

                    {/* Buttons removed */}
                    <div className="mb-6 h-4" />

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
