import React from 'react';
import { Card, Button } from '@/components/ui';

interface PartTransitionProps {
  completedPartTitle: string;
  completedPartNumber: number;
  nextPartTitle: string;
  nextPartNumber: number;
  totalParts: number;
  assessmentTitle: string;
  onContinue: () => void;
}

export function PartTransition({
  completedPartTitle,
  completedPartNumber,
  nextPartTitle,
  nextPartNumber,
  totalParts,
  assessmentTitle,
  onContinue
}: PartTransitionProps) {
  return (
    <Card className="animate-slide-in-up p-8 max-w-2xl mx-auto shadow-floating">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-10 h-10">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-bold text-text-heading mb-4">
          Section Complete!
        </h2>
        
        <div className="text-text-body mb-6">
          <p className="text-lg">You've completed:</p>
          <p className="font-medium text-xl text-primary mt-2 mb-2">
            {completedPartTitle}
          </p>
          <p className="text-sm text-text-light">
            Section {completedPartNumber} of {totalParts}
          </p>
        </div>
        
        <div className="bg-background rounded-lg p-6 mb-4 mt-8">
          <p className="text-lg font-medium mb-3">Moving on to:</p>
          <p className="font-bold text-2xl text-primary mb-2">{nextPartTitle}</p>
          <p className="text-sm text-text-light">
            Section {nextPartNumber} of {totalParts}
          </p>
        </div>
        
        <div className="mt-6 text-sm text-text-light">
          <p>Assessment: {assessmentTitle}</p>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          variant="primary" 
          onClick={onContinue}
          className="px-6 py-3 text-lg"
          animated
        >
          Continue to Next Section
        </Button>
      </div>
    </Card>
  );
} 