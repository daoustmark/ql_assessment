import React from 'react';
import { useTestSession } from '../../../contexts/TestSessionContext';
import { useTestNavigation } from '../../../utils/routing.utils';
import { Button } from '../ui/Button';
import { Instructions } from '../test/Instructions';

export function TestWelcome() {
  const { state, startSession } = useTestSession();
  const { goToSession } = useTestNavigation();

  const handleStart = async () => {
    try {
      await startSession(state.testId!, state.currentDay!);
      goToSession();
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to the Assessment</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Before You Begin</h2>
        <Instructions />
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleStart}
          disabled={!state.testId || !state.currentDay}
          className="px-8 py-3"
        >
          Begin Assessment
        </Button>
      </div>
    </div>
  );
} 