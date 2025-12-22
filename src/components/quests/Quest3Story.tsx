import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import { InteractiveAbacus } from '../InteractiveAbacus';
import { useAbacusSound } from '../../hooks/useAbacusSound';




interface Quest3StoryProps {
    onComplete: () => void;
}

export function Quest3Story({ onComplete }: Quest3StoryProps) {
    const [storyStep, setStoryStep] = useState(0);
    const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [startTime, setStartTime] = useState(Date.now());
    const { logInteraction } = useDataLogger();
    const { playSuccess } = useAbacusSound();


    useEffect(() => {
        setStartTime(Date.now());
    }, [storyStep]);

    const storyScenes = [
        {
            narrator: "In Mistress Creola's class, students are learning number positions...",
            character: '👦',
            characterName: 'Ameer',
            problem: "Ameer tried to show the number 5 but used the wrong beads.",
            question: "Help Ameer: Show the number 5 on the abacus.",
            number: 5,
        },
        {
            narrator: "Ameerah is working on the number 1...",
            character: '👧',
            characterName: 'Ameerah',
            problem: "Ameerah isn't sure if 1 uses the top bead or a lower bead.",
            question: "Help Ameerah: Show the number 1 on the abacus.",
            number: 1,
        },
    ];


    const currentStory = storyScenes[storyStep];

    const handleAbacusChange = (value: number) => {
        if (value === currentStory.number) {
            // Debounce success slightly to let animation finish
            setTimeout(() => {
                handleStorySuccess(value);
            }, 500);
        }
    };

    const handleStorySuccess = (value: number) => {
        const timeSpent = Date.now() - startTime;
        logInteraction({
            quest_id: 3,
            scene_id: `story_scene_${storyStep + 1}`,
            number: currentStory.number,
            correct_flag: true,
            time_ms: timeSpent,
            interaction_type: 'story',
            student_response: value.toString(),
        });

        playSuccess();
        setShowFeedback('correct');

        setTimeout(() => {

            if (storyStep < storyScenes.length - 1) {
                setStoryStep(storyStep + 1);
                setShowFeedback(null);
            } else {
                onComplete();
            }
        }, 2500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-brand-cream p-8"
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-brand-purple">
                    <h2 className="text-brand-purple text-center mb-6 text-2xl font-bold">📖 Story Time with Mistress Creola</h2>

                    <div className="bg-brand-purple/5 rounded-xl p-6 mb-6 border border-brand-purple/10">
                        <p className="text-brand-text-muted text-lg mb-4">{currentStory.narrator}</p>

                        <div className="flex items-center gap-4 mb-4 bg-white rounded-lg p-4 shadow-sm border border-brand-purple/10">
                            <div className="text-5xl">{currentStory.character}</div>
                            <div>
                                <p className="text-brand-text font-bold">{currentStory.characterName}</p>
                                <p className="text-brand-text-muted text-sm">{currentStory.problem}</p>
                            </div>
                        </div>

                        <div className="bg-brand-teal/10 rounded-lg p-4 border-2 border-brand-teal">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="text-2xl">🐝</div>
                                <p className="text-brand-teal font-bold">
                                    <strong>Abby prompts you:</strong>
                                </p>
                            </div>
                            <p className="text-brand-text text-lg">{currentStory.question}</p>
                        </div>
                    </div>

                    <div className="flex justify-center mb-8">
                        <InteractiveAbacus
                            key={storyStep} // Reset abacus for new question
                            rods={1}
                            onChange={handleAbacusChange}
                        />
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
