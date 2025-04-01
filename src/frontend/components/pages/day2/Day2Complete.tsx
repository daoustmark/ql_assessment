import React from 'react';
import { useTestSession } from '../../../contexts/TestSessionContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/Button';

export function Day2Complete() {
  const { session, completeSession } = useTestSession();
  const navigate = useNavigate();

  if (!session) {
    return <div>No active session found</div>;
  }

  const handleComplete = async () => {
    try {
      await completeSession();
      navigate('/test/welcome');
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Congratulations!</h2>
        <p className="text-xl text-gray-600 mb-8">
          You have completed Day 2 of your assessment. Thank you for your participation.
        </p>
        <p className="text-gray-600 mb-8">
          Your responses have been recorded and will be reviewed by our assessment team.
          You will be notified when your results are ready.
        </p>
        <Button onClick={handleComplete}>Return to Welcome Page</Button>
      </div>
    </div>
  );
} 