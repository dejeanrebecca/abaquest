import { useState, useEffect } from 'react';
import { DataLoggerProvider, useDataLogger } from './components/DataLogger';
import { ErrorBoundary } from './components/ErrorBoundary';
import { QuestEngineProvider, useQuestEngine } from './components/QuestEngine';
import { Library } from './components/screens/Library';
import { Settings } from './components/screens/Settings';
import { TeacherRosterDashboard as TeacherDashboard } from './components/auth/TeacherRosterDashboard';
import { Navigation } from './components/Navigation';
import { AbbyAvatar } from './components/AbbyAvatar';
import { Quest1Naming } from './components/quests/Quest1Naming';
import { Quest2Parts } from './components/quests/Quest2Parts';
import { Quest3Positioning } from './components/quests/Quest3Positioning';
import { Quest4Freeze } from './components/quests/Quest4Freeze';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SplashScreen } from './components/SplashScreen';
import { QuestId, StudentProfile } from './types/quest';

import { AuthScreen } from './components/auth/AuthScreen';
import { AnimatePresence } from 'motion/react';
import { studentService } from './services/studentService';
import { INITIAL_PROFILES } from './services/seedData';





export type Screen = 'library' | 'settings' | 'dashboard';

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<StudentProfile | null>(null);
  const [allProfiles, setAllProfiles] = useState<StudentProfile[]>([]);
  const [currentScreen, setCurrentScreen] = useState<Screen>('library');
  const [dbError, setDbError] = useState<string | null>(null);

  const { currentQuest, startQuest, exitQuest, completeQuest, loadProfile } = useQuestEngine();
  const { interactions } = useDataLogger();

  // Subscribe to all profiles for the teacher dashboard
  useEffect(() => {
    if (isAuthenticated) {
      const unsubscribe = studentService.subscribeToProfiles(
        (cloudProfiles) => {
          // Merge initial baseline with cloud updates
          const mergedInitial = INITIAL_PROFILES.map(ip => {
            const cloudVersion = cloudProfiles.find(sp => sp.id === ip.id);
            if (cloudVersion) {
              return {
                ...cloudVersion,
                teacherId: ip.teacherId,
                role: ip.role || 'student'
              };
            }
            return ip;
          });

          const customProfiles = cloudProfiles.filter(sp =>
            !INITIAL_PROFILES.some(dp => dp.id === sp.id)
          );

          // Deduplicate by ID
          const allProfilesMerged = [...mergedInitial, ...customProfiles];
          const uniqueProfiles = Array.from(new Map(allProfilesMerged.map(p => [p.id, p])).values());

          setAllProfiles(uniqueProfiles);
          setDbError(null);

          // If the current user is in the profiles, update them to keep them in sync
          if (authenticatedUser) {
            const updatedUser = uniqueProfiles.find(p => p.id === authenticatedUser.id);
            if (updatedUser) setAuthenticatedUser(updatedUser);
          }
        },
        (error) => {
          console.error("App: Firestore error:", error);
          setDbError(error.message || "Failed to connect to database");
        }
      );
      return () => unsubscribe();
    }
  }, [isAuthenticated, authenticatedUser?.id]);


  const handleQuestSelect = (questId: QuestId) => {
    startQuest(questId);
  };

  const handleQuestComplete = (results?: { pre: number; post: number }) => {
    const preScore = results?.pre ?? 100;
    const postScore = results?.post ?? 100;

    const interactionMetrics = {
      total: interactions.length,
      preTest: interactions.filter((i: any) => i.interaction_type === 'pre_test').length,
      practice: interactions.filter((i: any) => i.interaction_type === 'practice').length,
      postTest: interactions.filter((i: any) => i.interaction_type === 'post_test').length,
      story: interactions.filter((i: any) => i.interaction_type === 'story').length,
    };

    completeQuest(preScore, postScore, interactionMetrics, interactions);
    exitQuest();
    setCurrentScreen('library');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAuthenticatedUser(null);
    setCurrentScreen('library');
    exitQuest();
  };

  const handleHomeClick = () => {
    if (authenticatedUser?.role === 'teacher') {
      setCurrentScreen('dashboard');
    } else {
      setCurrentScreen('library');
    }
    if (currentQuest) exitQuest();
  };

  const renderContent = () => {
    if (currentQuest) {
      const QuestComponent = {
        1: Quest1Naming,
        2: Quest2Parts,
        3: Quest3Positioning,
        4: Quest4Freeze,
      }[currentQuest];

      return <QuestComponent onComplete={handleQuestComplete} />;
    }

    switch (currentScreen) {
      case 'library':
        return <Library onSelectQuest={handleQuestSelect} />;
      case 'settings':
        return <Settings />;
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

      {!showSplash && !isAuthenticated && (
        <AuthScreen onAuthenticated={(student) => {
          setAuthenticatedUser(student);
          loadProfile(student);
          setIsAuthenticated(true);

          if (student.role === 'teacher') {
            setCurrentScreen('dashboard');
            exitQuest();
          }
        }} />

      )}


      {!showSplash && isAuthenticated && (
        <div className="relative w-full min-h-screen bg-warm-neutral overflow-hidden">

          <div className="mx-auto max-w-[1024px] min-h-screen relative shadow-2xl bg-white overflow-hidden flex flex-col">

            <Breadcrumbs
              currentScreen={currentScreen}
              currentQuest={currentQuest}
              onHome={handleHomeClick}
              onLogout={handleLogout}
            />

            <main className="pb-24 flex-1 bg-warm-neutral">
              {currentScreen === 'dashboard' && authenticatedUser
                ? <TeacherDashboard
                  teacher={authenticatedUser}
                  allProfiles={allProfiles}
                  onUpdateProfiles={setAllProfiles}
                  onLogout={handleLogout}
                  dbError={dbError}
                />
                : renderContent()
              }
            </main>

            {!currentQuest && currentScreen !== 'dashboard' && authenticatedUser?.role !== 'teacher' && (
              <Navigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />
            )}

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
