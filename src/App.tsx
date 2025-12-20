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

export type Screen = 'library' | 'settings' | 'dashboard';

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('library');
  const { currentQuest, startQuest } = useQuestEngine();

  const handleQuestSelect = (questId: QuestId) => {
    startQuest(questId);
  };

  const handleQuestComplete = () => {
    // Return to library after quest completion
    setCurrentScreen('library');
  };

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
    }
  }

  // Otherwise render the selected screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'library':
        return <Library onSelectQuest={handleQuestSelect} />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
        return <TeacherDashboard onBack={() => setCurrentScreen('settings')} />;
      default:
        return <Library onSelectQuest={handleQuestSelect} />;
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-warm-neutral overflow-hidden">
      {/* Tablet Frame - 1024x768 optimized */}
      <div className="mx-auto max-w-[1024px] min-h-screen relative">
        {/* Main Content Area */}
        <main className="pb-24 min-h-screen">{renderScreen()}</main>

        {/* Bottom Navigation */}
        <Navigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />

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
