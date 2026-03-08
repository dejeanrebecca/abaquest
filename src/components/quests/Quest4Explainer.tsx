import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { AudioNarration } from '../AudioNarration';
import { ArrowRight, Snowflake } from 'lucide-react';
import { InteractiveAbacus } from '../InteractiveAbacus';

interface Quest4ExplainerProps {
    onNext: () => void;
}

export function Quest4Explainer({ onNext }: Quest4ExplainerProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-sky-50 p-8 flex flex-col items-center justify-center"
        >
            <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl p-10 border-2 border-sky-200">
                <h2 className="text-4xl font-bold text-sky-800 mb-8 text-center">
                    The Power of Zero (Freeze!)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-12">
                    <div className="space-y-6">
                        <AudioNarration
                            text="When you add Zero to a number, the number stays exactly the same. It's like a Freeze Ray!"
                            audioKey="q4_zero_freeze"
                            speaker="abby"
                            compact
                            autoPlay
                        />
                        <div className="bg-sky-100 p-6 rounded-xl border border-sky-200 mt-6">
                            <p className="text-3xl font-mono text-center text-sky-900">
                                5 + 0 = 5
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-center relative">
                        {/* Visual representation: A counter showing 5, with snowflakes around it indicating "frozen" */}
                        <div className="scale-75 origin-center relative">
                            <InteractiveAbacus initialValue={5} interactive={false} />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute -top-4 -right-4 text-sky-400"
                            >
                                <Snowflake size={48} />
                            </motion.div>
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <span className="text-8xl opacity-20">❄️</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <Button
                        onClick={onNext}
                        className="bg-sky-500 hover:bg-sky-600 text-white text-xl px-10 py-6 rounded-2xl"
                    >
                        I'm Ready to Learn! <ArrowRight className="ml-2" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
