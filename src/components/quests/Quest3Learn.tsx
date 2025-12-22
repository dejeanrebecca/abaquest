import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';


interface Quest3LearnProps {
    onComplete: () => void;
}

export function Quest3Learn({ onComplete }: Quest3LearnProps) {

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
            className="min-h-screen bg-warm-neutral p-8"
        >
            <div className="max-w-5xl mx-auto">
                <div className="bg-gradient-to-r from-aqua-blue to-deep-blue rounded-2xl p-4 mb-6 shadow-xl text-white">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6" />
                        <p className="text-xl">Discovery Time: Where Do Numbers Live?</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-sunburst-yellow">
                    <div className="flex items-start gap-4 mb-8 bg-sunburst-yellow/20 rounded-xl p-4">
                        <div className="text-4xl">🐝</div>
                        <div>
                            <p className="text-deep-blue text-xl mb-2">
                                <span className="font-semibold">Abby says:</span> "Each number has its own special home on our Junior Counter! Let's discover them together!"
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                        {/* Lower Beads: 0-4 */}
                        <div className="bg-aqua-blue/10 rounded-xl p-6 border-3 border-aqua-blue">
                            <h3 className="text-deep-blue text-center mb-4">🔵 Lower Beads (0-4)</h3>
                            <div className="flex justify-center mb-4">
                                {renderAbacusPosition('middle-lower', true)}
                            </div>
                            <div className="space-y-2 text-deep-blue/80">
                                <p>• <strong>Zero (0)</strong>: All beads away from the bar</p>
                                <p>• <strong>One (1)</strong>: Move 1 lower bead up</p>
                                <p>• <strong>Two-Four</strong>: Add more lower beads</p>
                            </div>
                        </div>

                        {/* Upper Beads: 5-9 */}
                        <div className="bg-sunburst-yellow/20 rounded-xl p-6 border-3 border-sunburst-yellow">
                            <h3 className="text-deep-blue text-center mb-4">🟡 Upper Beads (5-9)</h3>
                            <div className="flex justify-center mb-4">
                                {renderAbacusPosition('middle-upper', true)}
                            </div>
                            <div className="space-y-2 text-deep-blue/80">
                                <p>• <strong>Five (5)</strong>: Move the top bead down (equals 5!)</p>
                                <p>• <strong>Six-Nine</strong>: Top bead + lower beads</p>
                                <p>• <strong>Nine (9)</strong>: Top bead + all 4 lower beads</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-deep-blue/5 rounded-xl p-4 mb-6">
                        <p className="text-deep-blue text-center">
                            <strong>💡 Discovery Tip:</strong> The top bead is worth <em>five</em>! Lower beads are worth <em>one</em> each.
                        </p>
                    </div>

                    <Button
                        onClick={onComplete}
                        className="w-full bg-abacus-red hover:bg-abacus-red/90 text-white py-5 rounded-xl shadow-xl flex items-center justify-center gap-2"
                        size="lg"
                    >
                        Let's Practice!
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
