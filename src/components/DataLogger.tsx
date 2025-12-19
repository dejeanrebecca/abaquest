import { createContext, useContext, useState, ReactNode } from 'react';

// Data structure matching Quests 1 and 2 format
export interface LearnerInteraction {
  quest_id: number;
  scene_id: string;
  number: number | null;
  correct_flag: boolean | null;
  time_ms: number;
  timestamp: string;
  interaction_type: 'pre_test' | 'practice' | 'post_test' | 'story';
  student_response?: string;
}

interface DataLoggerContextType {
  interactions: LearnerInteraction[];
  logInteraction: (interaction: Omit<LearnerInteraction, 'timestamp'>) => void;
  getPreTestScore: () => number;
  getPostTestScore: () => number;
  getHighestNumberBuilt: () => number;
  getTotalCoins: () => number;
  clearData: () => void;
  studentName: string;
  setStudentName: (name: string) => void;
}

const DataLoggerContext = createContext<DataLoggerContextType | undefined>(undefined);

export function DataLoggerProvider({ children }: { children: ReactNode }) {
  const [interactions, setInteractions] = useState<LearnerInteraction[]>([]);
  const [studentName, setStudentName] = useState('');

  const logInteraction = (interaction: Omit<LearnerInteraction, 'timestamp'>) => {
    const newInteraction: LearnerInteraction = {
      ...interaction,
      timestamp: new Date().toISOString(),
    };
    setInteractions(prev => [...prev, newInteraction]);
    
    // Log to console for teacher/researcher review
    console.log('📊 Learning Data:', newInteraction);
  };

  const getPreTestScore = () => {
    const preTests = interactions.filter(i => i.interaction_type === 'pre_test' && i.correct_flag !== null);
    if (preTests.length === 0) return 0;
    const correct = preTests.filter(i => i.correct_flag === true).length;
    return Math.round((correct / preTests.length) * 100);
  };

  const getPostTestScore = () => {
    const postTests = interactions.filter(i => i.interaction_type === 'post_test' && i.correct_flag !== null);
    if (postTests.length === 0) return 0;
    const correct = postTests.filter(i => i.correct_flag === true).length;
    return Math.round((correct / postTests.length) * 100);
  };

  const getHighestNumberBuilt = () => {
    const numbers = interactions
      .filter(i => i.number !== null && i.correct_flag === true)
      .map(i => i.number as number);
    return numbers.length > 0 ? Math.max(...numbers) : 0;
  };

  const getTotalCoins = () => {
    // Calculate based on performance
    const postTestScore = getPostTestScore();
    const practiceCorrect = interactions.filter(
      i => i.interaction_type === 'practice' && i.correct_flag === true
    ).length;
    return postTestScore + (practiceCorrect * 5);
  };

  const clearData = () => {
    setInteractions([]);
    setStudentName('');
  };

  return (
    <DataLoggerContext.Provider
      value={{
        interactions,
        logInteraction,
        getPreTestScore,
        getPostTestScore,
        getHighestNumberBuilt,
        getTotalCoins,
        clearData,
        studentName,
        setStudentName,
      }}
    >
      {children}
    </DataLoggerContext.Provider>
  );
}

export function useDataLogger() {
  const context = useContext(DataLoggerContext);
  if (!context) {
    throw new Error('useDataLogger must be used within DataLoggerProvider');
  }
  return context;
}
