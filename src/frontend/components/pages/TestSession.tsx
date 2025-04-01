import React from 'react';
import { useTestSession } from '../../../contexts/TestSessionContext';
import { useTestNavigation } from '../../../utils/routing.utils';
import { Timer } from '../test/Timer';
import { ProgressIndicator } from '../test/ProgressIndicator';
import { QuestionContainer } from '../test/QuestionContainer';

export function TestSession() {
  const { state } = useTestSession();
  const { goToComplete } = useTestNavigation();

  if (!state.sessionId || !state.testId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2">No active test session found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <ProgressIndicator current={1} total={10} />
        <Timer duration={3600} onComplete={goToComplete} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <QuestionContainer
          sessionId={state.sessionId}
          testId={state.testId}
          currentSection={state.currentSection}
        />
      </div>
    </div>
  );
} 