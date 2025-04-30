import React from 'react';
import { Card, Button } from '@/components/ui';

interface BlockTransitionProps {
  prevBlockTitle?: string;
  nextBlockTitle?: string;
  partTitle: string;
  partProgress: { current: number; total: number };
  onContinue: () => void;
}

export function BlockTransition({
  prevBlockTitle,
  nextBlockTitle,
  partTitle,
  partProgress,
  onContinue
}: BlockTransitionProps) {
  return (
    <Card className="animate-slide-in-up p-8 max-w-2xl mx-auto shadow-floating">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-text-heading mb-3">
          Block Completed!
        </h2>
        
        <div className="text-text-body mb-3">
          <p className="text-lg mb-1">You've completed:</p>
          <p className="font-medium text-xl text-primary">{prevBlockTitle}</p>
        </div>
        
        <div className="bg-background rounded-lg p-4 mb-4">
          <p className="text-sm text-text-light mb-2">Current Section</p>
          <p className="font-medium">{partTitle}</p>
          <p className="text-sm text-text-light mt-2">Section {partProgress.current} of {partProgress.total}</p>
        </div>
        
        <div className="text-text-body mt-6">
          <p className="text-lg mb-2">Moving on to:</p>
          <p className="font-medium text-xl text-primary">{nextBlockTitle}</p>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button 
          variant="primary" 
          onClick={onContinue}
          animated
        >
          Continue
        </Button>
      </div>
    </Card>
  );
} 