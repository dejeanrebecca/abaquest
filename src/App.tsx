import { useState } from 'react';
import { DataLoggerProvider } from './components/DataLogger';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QuestEngineProvider, useQuestEngine } from './components/QuestEngine';
import { Library } from './components/screens/Library';
import { Settings } from './components/screens/Settings';
import { TeacherDashboard } from './components/screens/TeacherDashboard';
import { Navigation } from './components/Navigation';
import { AbbyAvatar } from './components/AbbyAvatar';
import { Quest1Naming } from './components/quests/Quest1Naming';
import { Quest2Parts } from './components/quests/Quest2Parts';
import { Quest3Positioning } from './components/quests/Quest3Positioning';
import { Quest4Freeze } from './components/quests/Quest4Freeze';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SplashScreen } from './components/SplashScreen';
import { QuestId } from './types/quest';
import { AnimatePresence } from 'motion/react';



export type Screen = 'library' | 'settings' | 'dashboard';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('library');
  const { currentQuest, startQuest, exitQuest } = useQuestEngine();



  const handleQuestSelect = (questId: QuestId) => {
    startQuest(questId);
  };

  const handleQuestComplete = () => {
    // Return to library after quest completion
    exitQuest();
    setCurrentScreen('library');
  };

  const handleHomeClick = () => {
    if (currentQuest) {
      exitQuest();
    }
    setCurrentScreen('library');
  };

  const renderContent = () => {
    // If a quest is active, render the quest screen
    if (currentQuest) {
      switch (currentQuest) {
        case 1:
          return <Quest1Naming onComplete={handleQuestComplete} />;
        case 2:
          return <Quest2Parts onComplete={handleQuestComplete} />;
        case 3:
          return <Quest3Positioning onComplete={handleQuestComplete} />;
        case 4:
          return <Quest4Freeze onComplete={handleQuestComplete} />;
        default:
          return null;
      }
    }

    // Otherwise render the selected screen
    switch (currentScreen) {
      case 'library':
        return <Library onSelectQuest={handleQuestSelect} />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
        // Teacher Dashboard is a full screen overlay, but we still respect the container
        return <TeacherDashboard onBack={() => setCurrentScreen('settings')} />;
      default:
        return <Library onSelectQuest={handleQuestSelect} />;
    }
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showSplash && (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {!showSplash && (
        <div className="relative w-full min-h-screen bg-warm-neutral overflow-hidden">
          {/* Tablet Frame - 1024x768 optimized */}
          <div className="mx-auto max-w-[1024px] min-h-screen relative shadow-2xl bg-white overflow-hidden flex flex-col">

            {/* Global Breadcrumbs Navigation */}
            <Breadcrumbs
              currentScreen={currentScreen}
              currentQuest={currentQuest}
              onHome={handleHomeClick}
            />

            {/* Main Content Area */}
            <main className="pb-24 flex-1 bg-warm-neutral">
              {renderContent()}
            </main>

            {/* Bottom Navigation - Only show when NOT in a quest */}
            {!currentQuest && (
              <Navigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
            )}

            {/* Floating Abby Avatar */}
            <AbbyAvatar />
          </div>
        </div>
      )}
    </>
  );
}

export default function App() {
  return (
    <DataLoggerProvider>
      <QuestEngineProvider>
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </QuestEngineProvider>
    </DataLoggerProvider>
  );
}
