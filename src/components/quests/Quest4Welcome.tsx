import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Play, Snowflake } from 'lucide-react';

interface Quest4WelcomeProps {
    onStart: () => void;
}

export function Quest4Welcome({ onStart }: Quest4WelcomeProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-gradient-to-b from-sky-200 to-indigo-100 p-8 flex items-center justify-center relative overflow-hidden"
        >
            {/* Background decorations for "Freeze" theme */}
            <div className="absolute top-20 left-20 text-white/40 animate-pulse delay-700">
                <Snowflake size={64} />
            </div>
            <div className="absolute bottom-20 right-20 text-white/40 animate-pulse delay-300">
                <Snowflake size={96} />
            </div>

            <div className="max-w-2xl w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border-4 border-sky-400 text-center relative z-10">
                <motion.div
                    initial={{ scale: 0.8, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-sky-100 p-6 rounded-full border-4 border-sky-300">
                            <span className="text-6xl">❄️</span>
                        </div>
                    </div>

                    <h1 className="text-5xl font-extrabold text-sky-900 mb-6 font-display">
                        Welcome to Freeze Addition!
                    </h1>

                    <p className="text-2xl text-sky-700 mb-8 leading-relaxed">
                        Get ready for a new adventure with Ameer and Ameerah!
                        <br />
                        We will learn the power of <strong>Zero</strong> and how it freezes numbers!
                    </p>

                    <Button
                        onClick={onStart}
                        size="lg"
                        className="text-2xl px-12 py-8 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                    >
                        <Play className="w-8 h-8 mr-3 fill-current" />
                        Let's Start
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}
