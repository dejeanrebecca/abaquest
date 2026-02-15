
import { JuniorCounter, numberToCounterState } from '../JuniorCounter';

interface Quest3ExplainerProps {
    onComplete: () => void;
}

export function Quest3Explainer({ onComplete }: Quest3ExplainerProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-sky-blue p-8 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">0</div>
            <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-float-delay">9</div>
            <div className="absolute top-1/2 left-20 text-4xl opacity-10">1</div>
            <div className="absolute top-1/3 right-20 text-4xl opacity-10">5</div>

            <div className="max-w-4xl w-full bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl z-10 flex flex-col items-center animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold text-deep-purple mb-6 text-center font-display">
                    Where Numbers Live
                </h1>

                <p className="text-xl md:text-2xl text-charcoal-gray mb-8 text-center leading-relaxed">
                    Every number has a special spot on the abacus!
                    <br />
                    Can you find where <strong>0</strong>, <strong>1</strong>, <strong>5</strong>, and <strong>9</strong> hide?
                </p>

                {/* Visual Examples - Max 3 as requested */}
                <div className="flex flex-col md:flex-row gap-8 mb-10 items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl font-bold text-primary-blue">1</span>
                        <div className="scale-75 origin-top">
                            <JuniorCounter initialState={numberToCounterState(1)} interactive={false} />
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <span className="text-2xl font-bold text-primary-blue">5</span>
                        <div className="scale-75 origin-top">
                            <JuniorCounter initialState={numberToCounterState(5)} interactive={false} />
                        </div>
                    </div>
                </div>

                <button
                    onClick={onComplete}
                    className="bg-sunburst-yellow hover:bg-yellow-400 text-deep-purple font-bold text-2xl py-4 px-12 rounded-full shadow-lg transform transition hover:scale-105 active:scale-95 border-b-4 border-yellow-500"
                >
                    Let's Explore!
                </button>
            </div>
        </div>
    );
}
