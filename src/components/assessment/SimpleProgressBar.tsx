import React from 'react';

interface SimpleProgressBarProps {
  current: number;
  total: number;
  label?: boolean;
  className?: string;
}

export function SimpleProgressBar({
  current,
  total,
  label = true,
  className = ''
}: SimpleProgressBarProps) {
  const progress = Math.round((current / total) * 100);
  
  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="text-bespoke-navy">Question {current} of {total}</span>
          <span className="text-bespoke-navy">{progress}% Complete</span>
        </div>
      )}
      
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-nomad-blue rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
} 