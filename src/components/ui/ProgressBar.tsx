"use client";

import React, { useState, useEffect } from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
  barClassName?: string;
}

export function ProgressBar({
  value,
  max,
  className = '',
  showLabel = false,
  labelClassName = '',
  barClassName = ''
}: ProgressBarProps) {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    // Animate the progress bar
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    setWidth(percentage);
  }, [value, max]);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className={`text-sm mb-1 flex justify-between ${labelClassName}`}>
          <span>{value} of {max} completed</span>
          <span>{Math.round((value / max) * 100)}%</span>
        </div>
      )}
      <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out bg-primary ${barClassName}`} 
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
} 