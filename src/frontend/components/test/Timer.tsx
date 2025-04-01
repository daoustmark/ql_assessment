import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/cn';

export interface TimerProps {
  duration: number; // in seconds
  onTimeUp?: () => void;
  className?: string;
}

export function Timer({ duration, onTimeUp, className }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isWarning, setIsWarning] = useState(false);
  const [isDanger, setIsDanger] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeUp?.();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        if (newTime <= 300) { // 5 minutes
          setIsWarning(true);
        }
        if (newTime <= 60) { // 1 minute
          setIsDanger(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimeUp]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-red-500';
    if (timeLeft <= 300) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div
      className={cn(
        'rounded-lg p-4 font-mono text-2xl font-bold',
        isDanger && 'bg-red-100 text-red-700',
        isWarning && !isDanger && 'bg-yellow-100 text-yellow-700',
        !isWarning && !isDanger && 'bg-gray-100 text-gray-700',
        getTimerColor(),
        className
      )}
    >
      {formatTime(timeLeft)}
    </div>
  );
} 