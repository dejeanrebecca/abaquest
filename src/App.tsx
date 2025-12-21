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
import { QuestId } from './types/quest';
import logo from 'figma:asset/14748deabced6f36e28c26602e29604c9ffd627a.png';

export type Screen = 'library' | 'settings' | 'dashboard';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('library');
  const { currentQuest, startQuest, exitQuest } = useQuestEngine();

  const handleQuestSelect = (questId: QuestId) => {
    startQuest(questId);
  };

  const handleQuestComplete = () => {
    // Return to library after quest completion
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
    <div className="relative w-full min-h-screen bg-warm-neutral overflow-hidden">
      {/* Tablet Frame - 1024x768 optimized */}
      <div className="mx-auto max-w-[1024px] min-h-screen relative shadow-2xl bg-white overflow-hidden">

        {/* Global Header / Home Button */}
        <div className="absolute top-4 left-4 z-50">
          <button
            onClick={handleHomeClick}
            className="hover:scale-105 transition-transform active:scale-95"
            aria-label="Back to Dashboard"
          >
            <img
              src={logo}
              alt="AbaQuest Home"
              className="w-16 h-16 object-cover rounded-full border-2 border-white drop-shadow-lg"
            />
          </button>
        </div>

        {/* Main Content Area */}
        <main className="pb-24 min-h-screen bg-warm-neutral">
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
