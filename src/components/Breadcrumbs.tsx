import { ChevronRight, Home, LogOut } from 'lucide-react';
import { Screen } from '../App';

interface BreadcrumbsProps {
    currentScreen: Screen;
    currentQuest: number | null;
    onHome: () => void;
    onLogout: () => void;
}

export function Breadcrumbs({ currentScreen, currentQuest, onHome, onLogout }: BreadcrumbsProps) {
    // If we are on the library screen and no quest is active, we don't strictly need breadcrumbs,
    // but we can show "Home" for consistency or hide it. 
    // Per plan: "If on Library (Home): Show Home (or nothing)" -> Let's show "Home" as a non-clickable text to indicate location.
    if (currentScreen === 'library' && !currentQuest) {
        return (
            <div className="w-full flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm border-b-2 border-warm-neutral text-deep-blue font-medium z-50">
                <div className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all text-sm font-bold"
                    title="Switch Account"
                >
                    <LogOut className="w-4 h-4 text-slate-500" />
                    <span>Switch Account</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b-2 border-warm-neutral z-50 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2">
                <button
                    onClick={onHome}
                    className="flex items-center gap-1 hover:text-abacus-red transition-colors font-medium text-deep-blue"
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

            <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all text-sm font-bold"
                title="Switch Account"
            >
                <LogOut className="w-4 h-4 text-slate-500" />
                <span>Switch Account</span>
            </button>
        </div>
    );
}
