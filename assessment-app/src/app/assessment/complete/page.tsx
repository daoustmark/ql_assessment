'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { useRouter } from 'next/navigation';

export default function AssessmentCompletePage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center assessment-bg p-4">
      <Card className="max-w-lg w-full animate-slide-in-up">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Assessment Completed</h1>
          <p className="text-gray-600 mb-8">
            Thank you for completing the assessment! Your responses have been saved.
          </p>
          
          <button 
            onClick={() => router.push('/profile')}
            className="btn btn-primary px-8"
          >
            Return to Dashboard
          </button>
        </div>
      </Card>
    </div>
  );
} 