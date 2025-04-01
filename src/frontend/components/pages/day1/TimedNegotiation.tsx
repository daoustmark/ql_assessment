import React from 'react';
import { useTestSession } from '../../../../contexts/TestSessionContext';
import { useTestNavigation } from '../../../../utils/routing.utils';
import { Timer } from '../../test/Timer';
import { ProgressIndicator } from '../../test/ProgressIndicator';
import { QuestionContainer } from '../../test/QuestionContainer';
import { Button } from '../../ui/Button';

export function TimedNegotiation() {
  const { state, submitAnswer } = useTestSession();
  const { goToDay1Section } = useTestNavigation();

  const handleNext = async () => {
    try {
      await goToDay1Section('ETHICAL');
    } catch (error) {
      console.error('Failed to navigate to next section:', error);
    }
  };

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
        <ProgressIndicator current={2} total={4} />
        <Timer duration={2400} onComplete={handleNext} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Timed Negotiation Exercise</h1>
        
        <div className="prose max-w-none mb-8">
          <p>
            In this section, you will be presented with various negotiation scenarios.
            You will have 40 minutes to complete this section.
          </p>
          <p>
            Each scenario will require you to analyze the situation and provide your
            recommended approach to negotiation.
          </p>
        </div>

        <QuestionContainer
          sessionId={state.sessionId}
          testId={state.testId}
          currentSection="NEGOTIATION"
          onAnswerSubmit={submitAnswer}
        />

        <div className="flex justify-end mt-8">
          <Button onClick={handleNext} className="px-6 py-2">
            Next Section
          </Button>
        </div>
      </div>
    </div>
  );
} 