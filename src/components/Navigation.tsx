import { Home, Settings, BarChart } from 'lucide-react';
import { motion } from 'motion/react';
import { Screen } from '../App';

interface NavigationProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export function Navigation({ currentScreen, onNavigate }: NavigationProps) {
  const navItems = [
    { screen: 'library' as Screen, icon: Home, label: 'Library' },
    { screen: 'settings' as Screen, icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1024px] bg-white border-t-4 border-deep-blue shadow-2xl z-40"
    >
      <div className="flex items-center justify-around py-4 px-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.screen;

          return (
            <button
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              className={`flex flex-col items-center gap-2 px-8 py-3 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-deep-blue to-aqua-blue text-white scale-110 shadow-xl'
                  : 'text-deep-blue/60 hover:text-deep-blue hover:bg-aqua-blue/10'
              }`}
            >
              <Icon className={`w-8 h-8 ${isActive ? 'animate-bounce' : ''}`} />
              <span className={`text-sm ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}