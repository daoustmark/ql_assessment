import React from 'react';
import { useTestSession } from '../../../contexts/TestSessionContext';
import { useTestNavigation } from '../../../utils/routing.utils';
import { Button } from '../ui/Button';

export function TestComplete() {
  const { state, completeSession } = useTestSession();
  const { goToWelcome } = useTestNavigation();

  const handleComplete = async () => {
    try {
      await completeSession();
      goToWelcome();
    } catch (error) {
      console.error('Failed to complete session:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-6">Assessment Complete</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <p className="text-lg mb-4">
            Thank you for completing the assessment. Your responses have been recorded.
          </p>
          
          {state.currentDay === 1 && (
            <p className="text-lg mb-4">
              You will receive instructions for Day 2 of the assessment shortly.
            </p>
          )}
          
          {state.currentDay === 2 && (
            <p className="text-lg mb-4">
              You have completed all parts of the assessment. We will contact you with next steps.
            </p>
          )}
        </div>

        <Button onClick={handleComplete} className="px-8 py-3">
          Return to Home
        </Button>
      </div>
    </div>
  );
} 