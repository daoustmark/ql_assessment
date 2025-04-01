import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';

interface TestSessionState {
  sessionId: string | null;
  testId: string | null;
  currentDay: number | null;
  currentSection: string | null;
  answers: Record<string, any>;
  status: 'IDLE' | 'LOADING' | 'IN_PROGRESS' | 'COMPLETED' | 'ERROR';
  error: string | null;
  startTime: Date | null;
  endTime: Date | null;
}

type TestSessionAction =
  | { type: 'START_SESSION'; payload: { sessionId: string; testId: string; currentDay: number } }
  | { type: 'UPDATE_SECTION'; payload: { section: string } }
  | { type: 'SUBMIT_ANSWER'; payload: { questionId: string; answer: any } }
  | { type: 'COMPLETE_SESSION' }
  | { type: 'SET_ERROR'; payload: { error: string } }
  | { type: 'RESET_SESSION' };

const initialState: TestSessionState = {
  sessionId: null,
  testId: null,
  currentDay: null,
  currentSection: null,
  answers: {},
  status: 'IDLE',
  error: null,
  startTime: null,
  endTime: null,
};

const TestSessionContext = createContext<{
  state: TestSessionState;
  startSession: (testId: string, currentDay: number) => Promise<void>;
  updateSection: (section: string) => void;
  submitAnswer: (questionId: string, answer: any) => Promise<void>;
  completeSession: () => Promise<void>;
  resetSession: () => void;
} | null>(null);

function testSessionReducer(state: TestSessionState, action: TestSessionAction): TestSessionState {
  switch (action.type) {
    case 'START_SESSION':
      return {
        ...state,
        sessionId: action.payload.sessionId,
        testId: action.payload.testId,
        currentDay: action.payload.currentDay,
        status: 'IN_PROGRESS',
        startTime: new Date(),
        error: null,
      };
    case 'UPDATE_SECTION':
      return {
        ...state,
        currentSection: action.payload.section,
      };
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.payload.questionId]: action.payload.answer,
        },
      };
    case 'COMPLETE_SESSION':
      return {
        ...state,
        status: 'COMPLETED',
        endTime: new Date(),
      };
    case 'SET_ERROR':
      return {
        ...state,
        status: 'ERROR',
        error: action.payload.error,
      };
    case 'RESET_SESSION':
      return initialState;
    default:
      return state;
  }
}

export function TestSessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(testSessionReducer, initialState);
  const { token } = useAuth();

  const startSession = useCallback(async (testId: string, currentDay: number) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: { error: null } });
      const response = await fetch('/api/test-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ testId, currentDay }),
      });

      if (!response.ok) {
        throw new Error('Failed to start test session');
      }

      const { sessionId } = await response.json();
      dispatch({ type: 'START_SESSION', payload: { sessionId, testId, currentDay } });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error instanceof Error ? error.message : 'Failed to start session' },
      });
    }
  }, [token]);

  const updateSection = useCallback((section: string) => {
    dispatch({ type: 'UPDATE_SECTION', payload: { section } });
  }, []);

  const submitAnswer = useCallback(async (questionId: string, answer: any) => {
    try {
      if (!state.sessionId) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/test-sessions/${state.sessionId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ questionId, answer }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      dispatch({ type: 'SUBMIT_ANSWER', payload: { questionId, answer } });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error instanceof Error ? error.message : 'Failed to submit answer' },
      });
    }
  }, [state.sessionId, token]);

  const completeSession = useCallback(async () => {
    try {
      if (!state.sessionId) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/test-sessions/${state.sessionId}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete session');
      }

      dispatch({ type: 'COMPLETE_SESSION' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: { error: error instanceof Error ? error.message : 'Failed to complete session' },
      });
    }
  }, [state.sessionId, token]);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  return (
    <TestSessionContext.Provider
      value={{
        state,
        startSession,
        updateSection,
        submitAnswer,
        completeSession,
        resetSession,
      }}
    >
      {children}
    </TestSessionContext.Provider>
  );
}

export function useTestSession() {
  const context = useContext(TestSessionContext);
  if (!context) {
    throw new Error('useTestSession must be used within a TestSessionProvider');
  }
  return context;
} 