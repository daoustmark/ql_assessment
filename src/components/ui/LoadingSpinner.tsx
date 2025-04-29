'use client';

import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'lg' 
}: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <span className={`loading loading-spinner loading-${size} text-nomad-blue`}></span>
      <p className="mt-4 text-bespoke-navy-75">{message}</p>
    </div>
  );
} 