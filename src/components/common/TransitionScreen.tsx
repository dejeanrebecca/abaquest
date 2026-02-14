import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

interface TransitionScreenProps {
    title: string;
    subtitle?: string;
    icon?: string; // Emoji or image URL
    imageSrc?: string; // Custom image URL (e.g., imported asset)
    onNext: () => void;
    buttonText?: string;
    variant?: 'story' | 'learning' | 'default';
    showBookIcon?: boolean;
}

export function TransitionScreen({
    title,
    subtitle,
    icon,
    imageSrc,
    onNext,
    buttonText = "Continue",
    variant = 'default',
    showBookIcon = false,
}: TransitionScreenProps) {

    const getBackground = () => {
        switch (variant) {
            case 'story': return 'bg-gradient-to-b from-purple-100 to-warm-neutral';
            case 'learning': return 'bg-gradient-to-b from-sky-100 to-warm-neutral';
            default: return 'bg-warm-neutral';
        }
    };

    const getBorderColor = () => {
        switch (variant) {
            case 'story': return 'border-deep-blue';
            case 'learning': return 'border-aqua-blue';
            default: return 'border-sunburst-yellow';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen ${getBackground()} p-8 flex items-center justify-center`}
        >
            <div className={`max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-10 border-4 ${getBorderColor()} text-center`}>

                {(showBookIcon || imageSrc) && (
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        className="w-48 h-48 mx-auto mb-6 bg-transparent p-2 rounded-2xl transform rotate-3 flex items-center justify-center"
                    >
                        <img
                            src={imageSrc || "/src/assets/book-icon.svg"}
                            alt="Story Time"
                            className="w-full h-full object-contain drop-shadow-xl"
                        />
                    </motion.div>
                )}

                {icon && !showBookIcon && !imageSrc && (
                    <div className="text-8xl mb-6">{icon}</div>
                )}

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl font-bold text-deep-blue mb-4"
                >
                    {title}
                </motion.h2>

                {subtitle && (
                    <motion.h3
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-2xl text-deep-blue/80 mb-10"
                    >
                        {subtitle}
                    </motion.h3>
                )}

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <Button
                        onClick={onNext}
                        className="w-full max-w-md bg-abacus-red hover:bg-abacus-red/90 text-white py-6 rounded-2xl shadow-xl text-xl"
                        size="lg"
                    >
                        {buttonText} <ArrowRight className="w-6 h-6 ml-2" />
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}
