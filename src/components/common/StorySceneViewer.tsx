import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioNarration } from '../AudioNarration';

export type StorySceneData = {
    imageSrc: string;
    secondaryImageSrc?: string;
    altText?: string;
    narrationText: string;
    audioKey?: string;
    speaker?: 'abby' | 'ameer' | 'ameerah' | 'mistress-creola' | 'narrator';
};

interface StorySceneViewerProps {
    scenes: StorySceneData[];
    onComplete: () => void;
    title?: string;
}

export function StorySceneViewer({
    scenes,
    onComplete,
    title = "📖 Story Time"
}: StorySceneViewerProps) {
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [narrationComplete, setNarrationComplete] = useState(false);

    const currentScene = scenes[currentSceneIndex];

    const handleNext = () => {
        if (currentSceneIndex < scenes.length - 1) {
            setCurrentSceneIndex(currentSceneIndex + 1);
            setNarrationComplete(false);
        } else {
            onComplete();
        }
    };

    const handlePrevious = () => {
        if (currentSceneIndex > 0) {
            setCurrentSceneIndex(currentSceneIndex - 1);
            setNarrationComplete(false);
        }
    };

    if (!scenes || scenes.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-b from-purple-100 to-warm-neutral p-6 md:p-8"
        >
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10 border-4 border-deep-blue">
                    <h2 className="text-deep-blue text-center mb-6 text-2xl md:text-3xl font-bold">
                        {title}
                    </h2>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSceneIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col gap-6"
                        >
                            {/* Scene Image */}
                            <div className="relative w-full aspect-[4/3] sm:aspect-video bg-gray-50 rounded-2xl overflow-hidden border-4 border-aqua-blue shadow-inner flex items-center justify-center p-4">
                                {currentScene.secondaryImageSrc ? (
                                    <div className="flex w-full h-full gap-4 items-center justify-center p-4">
                                        <div className="w-1/2 h-full flex items-center justify-center relative">
                                            <img
                                                src={currentScene.imageSrc}
                                                alt={currentScene.altText || `Story Scene ${currentSceneIndex + 1} Image 1`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                        <div className="w-1/2 h-full flex items-center justify-center relative">
                                            <img
                                                src={currentScene.secondaryImageSrc}
                                                alt={`Story Scene ${currentSceneIndex + 1} Image 2`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <img
                                        src={currentScene.imageSrc}
                                        alt={currentScene.altText || `Story Scene ${currentSceneIndex + 1}`}
                                        className="w-full h-full object-contain"
                                    />
                                )}
                            </div>

                            {/* Narration */}
                            <div className="min-h-[120px]">
                                <AudioNarration
                                    key={`narration-${currentSceneIndex}`} // Force remount on scene change
                                    text={currentScene.narrationText}
                                    audioKey={currentScene.audioKey}
                                    speaker={currentScene.speaker || 'narrator'}
                                    autoPlay={true}
                                    onComplete={() => setNarrationComplete(true)}
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Controls */}
                    <div className="flex justify-between items-center mt-8 gap-4">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentSceneIndex === 0}
                            variant="outline"
                            className="py-6 px-6 text-lg rounded-xl border-2 border-deep-blue text-deep-blue hover:bg-gray-100 disabled:opacity-50"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" /> Back
                        </Button>

                        <div className="text-deep-blue font-semibold hidden sm:block">
                            Scene {currentSceneIndex + 1} of {scenes.length}
                        </div>

                        <Button
                            onClick={handleNext}
                            className={`py-6 px-8 text-lg rounded-xl shadow-lg transition-all ${narrationComplete
                                ? 'bg-green-500 hover:bg-green-600 animate-pulse'
                                : 'bg-abacus-red hover:bg-abacus-red/90'
                                } text-white`}
                        >
                            {currentSceneIndex === scenes.length - 1 ? 'Finish Story ✨' : 'Next '}
                            {currentSceneIndex !== scenes.length - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
