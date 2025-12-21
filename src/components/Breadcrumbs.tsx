import { ChevronRight, Home } from 'lucide-react';
import { Screen } from '../App';

interface BreadcrumbsProps {
    currentScreen: Screen;
    currentQuest: number | null;
    onHome: () => void;
}

export function Breadcrumbs({ currentScreen, currentQuest, onHome }: BreadcrumbsProps) {
    // If we are on the library screen and no quest is active, we don't strictly need breadcrumbs,
    // but we can show "Home" for consistency or hide it. 
    // Per plan: "If on Library (Home): Show Home (or nothing)" -> Let's show "Home" as a non-clickable text to indicate location.
    if (currentScreen === 'library' && !currentQuest) {
        return (
            <div className="w-full flex items-center gap-2 px-6 py-4 bg-white/80 backdrop-blur-sm border-b-2 border-warm-neutral text-deep-blue font-medium z-50">
                <Home className="w-4 h-4" />
                <span>Home</span>
            </div>
        );
    }

    return (
        <div className="w-full flex items-center gap-2 px-6 py-4 bg-white/90 backdrop-blur-md border-b-2 border-warm-neutral z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <button
                onClick={onHome}
                className="flex items-center gap-1 hover:text-abacus-red transition-colors font-medium"
            >
                <Home className="w-4 h-4" />
                <span>Home</span>
            </button>

            <ChevronRight className="w-4 h-4 text-gray-400" />

            <span className="font-bold text-abacus-red">
                {currentQuest ? `Quest ${currentQuest}` : (
                    currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1)
                )}
            </span>
        </div>
    );
}
