import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

export interface TestSession {
  id: string;
  testId: string;
  currentSection: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  startTime: Date;
  endTime?: Date;
}

interface TestSessionContextType {
  session: TestSession | null;
  updateSession: (session: TestSession) => Promise<void>;
  completeSession: () => Promise<void>;
}

const TestSessionContext = createContext<TestSessionContextType | undefined>(undefined);

export function TestSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<TestSession | null>(null);
  const { token } = useAuth();

  const updateSession = useCallback(async (updatedSession: TestSession) => {
    // TODO: Implement API call to update session
    setSession(updatedSession);
  }, []);

  const completeSession = useCallback(async () => {
    if (!session) return;
    // TODO: Implement API call to complete session
    setSession({
      ...session,
      status: 'COMPLETED',
      endTime: new Date(),
    });
  }, [session]);

  return (
    <TestSessionContext.Provider value={{ session, updateSession, completeSession }}>
      {children}
    </TestSessionContext.Provider>
  );
}

export function useTestSession() {
  const context = useContext(TestSessionContext);
  if (context === undefined) {
    throw new Error('useTestSession must be used within a TestSessionProvider');
  }
  return context;
} 