"use client";

import React, { useEffect, useState } from 'react';
import { colors } from '@/lib/designSystem';

interface ProgressBarProps {
  current?: number;
  total?: number;
  value?: number;
  max?: number;
  variant?: 'primary' | 'gradient' | 'blue';
  showText?: boolean;
  label?: string;
  height?: string;
  className?: string;
  showPulse?: boolean;
}

export function ProgressBar({
  current,
  total,
  value,
  max,
  variant = 'primary',
  showText = true,
  label,
  height = 'h-2',
  className = '',
  showPulse = false
}: ProgressBarProps) {
  // Use provided current/total or value/max
  const currentValue = current !== undefined ? current : (value !== undefined ? value : 0);
  const totalValue = total !== undefined ? total : (max !== undefined ? max : 1);
  
  // Safely calculate percentage - ensure we have valid values to prevent NaN
  const safeCurrentValue = Number.isFinite(currentValue) ? currentValue : 0;
  const safeTotalValue = Number.isFinite(totalValue) && totalValue > 0 ? totalValue : 1;
  
  const percentage = Math.min(100, Math.max(0, Math.round((safeCurrentValue / safeTotalValue) * 100)));
  
  // Get appropriate background color based on variant
  const getBarClass = () => {
    switch(variant) {
      case 'primary':
        return 'bg-primary-600';
      case 'gradient':
        return 'bg-gradient-to-r from-primary-600 to-primary-500';
      case 'blue':
        return 'bg-blue-600';
      default:
        return 'bg-primary-600';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center mb-1 text-sm font-medium">
          <div className="text-neutral-700">
            {label ? label : `${safeCurrentValue} of ${safeTotalValue}`}
          </div>
          <div className="text-primary-700">
            {percentage}%
          </div>
        </div>
      )}
      
      <div className={`${height} bg-neutral-200 rounded-full overflow-hidden`}>
        <div 
          className={`h-full rounded-full ${getBarClass()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {/* Optional pulse dot at end of progress */}
      {showPulse && percentage > 0 && (
        <div className="relative">
          <div
            className="absolute -top-[3px] h-2 w-2 rounded-full bg-primary-400 transform -translate-y-1/2"
            style={{ left: `calc(${percentage}% - 3px)` }}
          >
            <div className="absolute inset-0 rounded-full bg-primary-300 animate-pulse opacity-75"></div>
          </div>
        </div>
      )}
    </div>
  );
} 