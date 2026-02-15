import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, ArrowRight, BookOpen } from 'lucide-react';
import { useDataLogger } from '../DataLogger';
import { JuniorCounter, JuniorCounterState } from '../JuniorCounter';
import { useAbacusSound } from '../../hooks/useAbacusSound';
import { Button } from '../ui/button';
import { AudioNarration } from '../AudioNarration';

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
            id: 'scene_1_ameer_5',
            narrator: "In Mistress Creola's class, students are learning number positions...",
            character: '👦',
            characterName: 'Ameer',
            problem: "Ameer tried to show the number 5 but used the wrong beads.",
            question: "Help Ameer: Show the number 5 on the abacus.",
            hint: "Five uses the top bead!",
            number: 5,
            imagePlaceholder: "story_scene_1.webp",
            voiceText: "In Mistress Creola's class, students are learning number positions. Ameer tried to show the number 5 but used the wrong beads. Help Ameer! Show the number 5 on the abacus."
        },
        {
            id: 'scene_2_ameerah_1',
            narrator: "Ameerah is working on the number 1...",
            character: '👧',
            characterName: 'Ameerah',
            problem: "Ameerah isn't sure if 1 uses the top bead or a lower bead.",
            question: "Help Ameerah: Show the number 1 on the abacus.",
            hint: "One uses a lower bead!",
            number: 1,
            imagePlaceholder: "story_scene_2.webp",
            voiceText: "Ameerah is working on the number 1. She isn't sure if 1 uses the top bead or a lower bead. Help Ameerah! Show the number 1 on the abacus."
        },
        {
            id: 'scene_3_ameer_9',
            narrator: "Now for the big challenge! Ameer needs to show NINE.",
            character: '👦',
            characterName: 'Ameer',
            problem: "He knows it uses a lot of beads!",
            question: "Help Ameer: Show the number 9 on the abacus.",
            hint: "Top bead PLUS all four lower beads!",
            number: 9,
            imagePlaceholder: "story_scene_3.webp",
            voiceText: "Now for the big challenge! Ameer needs to show NINE. He knows it uses a lot of beads! Help Ameer! Show the number 9 on the abacus."
        }
    ];

    const currentStory = storyScenes[storyStep];

    const handleStateChange = (state: JuniorCounterState, value: number) => {
        if (showFeedback === 'correct') return;

        if (value === currentStory.number) {
            setTimeout(() => {
                handleStorySuccess(value);
            }, 500);
        }
    };

    const handleStorySuccess = (value: number) => {
        const timeSpent = Date.now() - startTime;
        logInteraction({
            quest_id: 3,
            scene_id: currentStory.id,
            number: currentStory.number,
            correct_flag: true,
            time_ms: timeSpent,
            interaction_type: 'story',
            student_response: value.toString(),
        });

        playSuccess();
        setShowFeedback('correct');
    };

    const handleNext = () => {
        if (storyStep < storyScenes.length - 1) {
            setStoryStep(storyStep + 1);
            setShowFeedback(null);
        } else {
            onComplete();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-brand-cream p-4 md:p-8 flex flex-col items-center"
        >
            <div className="w-full max-w-5xl">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-l-8 border-brand-purple flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-brand-purple/10 p-3 rounded-full">
                            <BookOpen className="w-8 h-8 text-brand-purple" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-brand-purple">Story Time with Mistress Creola</h2>
                            <p className="text-brand-text-muted">Chapter {storyStep + 1}: {currentStory.characterName}'s Challenge</p>
                        </div>
                    </div>
                    {/* Narration Control */}
                    <div className="flex-shrink-0">
                        <AudioNarration
                            key={storyStep} // Re-mount to auto-play new text
                            text={currentStory.voiceText}
                            speaker="narrator"
                            autoPlay={true}
                            compact={true}
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Story / Context Side */}
                    <div className="flex flex-col gap-6">
                        {/* Image Placeholder */}
                        <div className="aspect-video bg-gray-200 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center relative overflow-hidden group">
                            <img
                                src={`/src/assets/story/${currentStory.imagePlaceholder}`}
                                onError={(e) => {
                                    // Fallback if image doesn't exist
                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400/e2e8f0/475569?text=Story+Scene+' + (storyStep + 1);
                                }}
                                alt="Story Scene"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
                                <p className="font-medium">{currentStory.narrator}</p>
                            </div>
                        </div>

                        {/* Character Info */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-brand-purple/10">
                            <div className="flex items-start gap-4">
                                <div className="text-5xl bg-brand-purple/5 p-2 rounded-xl">{currentStory.character}</div>
                                <div>
                                    <h3 className="text-xl font-bold text-deep-blue mb-1">{currentStory.characterName} says:</h3>
                                    <p className="text-charcoal-gray italic">"{currentStory.problem}"</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Interaction Side */}
                    <div className="flex flex-col gap-6">
                        {/* Prompt */}
                        <div className="bg-brand-teal/10 p-6 rounded-2xl border-2 border-brand-teal relative">
                            <div className="absolute -top-3 -left-3 bg-brand-teal text-white px-4 py-1 rounded-full text-sm font-bold shadow-md">
                                YOUR TURN
                            </div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="text-3xl">🐝</div>
                                <p className="font-bold text-brand-teal text-lg">Abby needs you!</p>
                            </div>
                            <p className="text-xl text-deep-blue font-medium leading-relaxed">
                                {currentStory.question}
                            </p>
                        </div>

                        {/* Abacus */}
                        <div className="bg-white rounded-[2rem] shadow-xl p-8 border-4 border-brand-teal flex justify-center scale-100 md:scale-105 origin-top">
                            <JuniorCounter
                                key={storyStep} // Reset state on step change
                                targetNumber={currentStory.number}
                                onStateChange={handleStateChange}
                                showHints={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Feedback Overlay */}
                <AnimatePresence>
                    {showFeedback === 'correct' && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20"
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 50 }}
                                animate={{ scale: 1, y: 0 }}
                                className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center border-4 border-brand-success"
                            >
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle className="w-12 h-12 text-brand-success" />
                                </div>
                                <h3 className="text-3xl font-bold text-brand-success mb-2">Excellent!</h3>
                                <p className="text-xl text-charcoal-gray mb-6">
                                    You helped {currentStory.characterName} find {currentStory.number}!
                                </p>
                                <Button
                                    onClick={handleNext}
                                    className="w-full bg-brand-success hover:bg-green-600 text-white text-xl py-6 rounded-xl shadow-lg"
                                >
                                    {storyStep < storyScenes.length - 1 ? "Next Chapter" : "Finish Story"}
                                    <ArrowRight className="ml-2 w-6 h-6" />
                                </Button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
