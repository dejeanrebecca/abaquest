import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useDataLogger } from '../DataLogger';


interface Quest3StoryProps {
    onComplete: () => void;
}

export function Quest3Story({ onComplete }: Quest3StoryProps) {
    const [storyStep, setStoryStep] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const { logInteraction } = useDataLogger();

    useEffect(() => {
        setStartTime(Date.now());
    }, [storyStep]);

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
                onComplete();
            }
        }, 2000);
    };

    const renderAbacusPosition = (position: string, isHighlighted: boolean = false) => {
        return (
            <div className="flex flex-col items-center gap-1">
                <div
                    className={`w-10 h-10 rounded-full transition-all shadow-lg ${position === 'top' && isHighlighted
                        ? 'bg-sunburst-yellow ring-4 ring-aqua-blue scale-110'
                        : position === 'top'
                            ? 'bg-sunburst-yellow'
                            : 'bg-gray-300'
                        }`}
                ></div>
                <div className="w-1 h-6 bg-gray-700 rounded"></div>
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

    return (
        <motion.div
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
