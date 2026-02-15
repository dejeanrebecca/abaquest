import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Volume2 } from 'lucide-react';
import { JuniorCounter } from '../JuniorCounter';
import { AudioNarration } from '../AudioNarration';

interface Quest4StoryProps {
    onComplete: () => void;
}

export function Quest4Story({ onComplete }: Quest4StoryProps) {
    const [chapter, setChapter] = useState(0);
    const [showInteraction, setShowInteraction] = useState(false);
    const [userAnswer, setUserAnswer] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const storyChapters = [
        {
            id: 'chapter1',
            title: "The Ice Valley",
            text: "Ameer traveled to the magical Ice Valley. It was very cold! He found 3 shiny ice crystals on the ground.",
            visualValue: 3,
            question: "How many crystals did Ameer find?",
            correctAnswer: 3,
            options: [1, 3, 5],
            image: "story_scene_1.webp" // Placeholder
        },
        {
            id: 'chapter2',
            title: "The Magic Chill",
            text: "Suddenly, a cold wind blew. It was the Magic Chill! The wind added ZERO crystals to Ameer's pile. It just froze everything!",
            visualValue: 3,
            question: "3 crystals plus 0 crystals is...?",
            correctAnswer: 3,
            options: [0, 3, 30],
            image: "story_scene_2.webp"
        },
        {
            id: 'chapter3',
            title: "The Frozen Bridge",
            text: "Ameer came to a bridge. The guard said, 'You need 5 crystals to cross. You have 3. If I give you ZERO more, can you cross?'",
            visualValue: 3,
            question: "Ameer has 3. He gets 0 more. Does he have 5?",
            correctAnswer: 0, // 0 for No (logic handled in selection) - let's stick to number selection for simplicity or Yes/No
            // Let's rephrase to addition: "He needs 2 more. But the guard gives 0. 3 + 0 = ?"
            rephrasedQuestion: "Ameer has 3. The guard adds 0. How many does he have now?",
            correctAnswerNum: 3,
            options: [3, 5, 0],
            image: "story_scene_3.webp"
        }
    ];

    const currentChapter = storyChapters[chapter];

    const handleAnswer = (answer: number) => {
        setUserAnswer(answer);

        // For chapter 3, logic is "3", so he can't cross.
        const target = currentChapter.id === 'chapter3' ? currentChapter.correctAnswerNum : currentChapter.correctAnswer;

        if (answer === target) {
            setFeedback("Correct! The Ice Magic holds true!");
            setTimeout(() => {
                if (chapter < storyChapters.length - 1) {
                    setChapter(c => c + 1);
                    setShowInteraction(false);
                    setUserAnswer(null);
                    setFeedback(null);
                } else {
                    onComplete();
                }
            }, 2000);
        } else {
            setFeedback("Not quite! Remember, adding zero changes nothing!");
        }
    };

    return (
        <div className="min-h-screen bg-sky-100 p-6 flex flex-col items-center">
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-sky-300">
                {/* Header Image Area */}
                <div className="h-64 bg-sky-200 relative flex items-center justify-center">
                    {/* Placeholder for story images */}
                    <div className="text-sky-800/20 text-9xl font-bold">❄️</div>
                    <div className="absolute bottom-4 left-4 bg-black/30 text-white px-4 py-2 rounded-xl backdrop-blur-md">
                        {currentChapter.title}
                    </div>
                </div>

                <div className="p-8">
                    {/* Story Text */}
                    <div className="mb-8 flex gap-4 items-start">
                        <div className="bg-sky-500 rounded-full p-3 text-white">
                            <Volume2 />
                        </div>
                        <div className="text-xl text-gray-700 leading-relaxed font-medium">
                            {currentChapter.text}
                            <AudioNarration
                                text={currentChapter.text}
                                speaker="narrator"
                                autoPlay
                                key={currentChapter.id}
                                onComplete={() => setShowInteraction(true)}
                            />
                        </div>
                    </div>

                    <AnimatePresence mode='wait'>
                        {showInteraction && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-sky-50 p-6 rounded-2xl border-2 border-sky-100"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="scale-75">
                                        <JuniorCounter value={currentChapter.visualValue} interactive={false} />
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-sky-900 mb-6">
                                            {currentChapter.id === 'chapter3' ? currentChapter.rephrasedQuestion : currentChapter.question}
                                        </h3>

                                        <div className="grid grid-cols-3 gap-4">
                                            {currentChapter.options.map((opt) => (
                                                <Button
                                                    key={opt}
                                                    onClick={() => handleAnswer(opt)}
                                                    variant={userAnswer === opt ? (feedback?.includes("Correct") ? "default" : "destructive") : "outline"}
                                                    className="text-2xl py-8 rounded-xl border-2 border-sky-200 hover:bg-sky-100"
                                                >
                                                    {opt}
                                                </Button>
                                            ))}
                                        </div>

                                        {feedback && (
                                            <motion.div
                                                initial={{ scale: 0.8 }}
                                                animate={{ scale: 1 }}
                                                className={`mt-4 text-xl font-bold text-center ${feedback.includes("Correct") ? "text-green-600" : "text-orange-500"}`}
                                            >
                                                {feedback}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
