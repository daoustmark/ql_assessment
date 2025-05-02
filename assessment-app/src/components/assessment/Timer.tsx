import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialTime: number; // Time in seconds
  onTimeUp?: () => void;
}

export function Timer({ initialTime = 300, onTimeUp }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  
  useEffect(() => {
    // Timer is always running, no pause functionality
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        return newTime;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onTimeUp]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate percentage of time remaining
  const percentLeft = (timeLeft / initialTime) * 100;
  
  // Determine color based on time remaining
  const getColor = () => {
    if (percentLeft > 50) return 'bg-success';
    if (percentLeft > 25) return 'bg-warning';
    return 'bg-error';
  };
  
  // Determine if time is up
  const isTimeUp = timeLeft === 0;
  
  return (
    <div className={`w-full p-3 border rounded-lg shadow-sm 
      ${isTimeUp ? 'bg-error bg-opacity-10 border-error animate-pulse' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-2">
        <div className={`text-lg font-medium ${isTimeUp ? 'text-error' : ''}`}>
          {isTimeUp ? 'Time Expired' : 'Time Remaining'}
        </div>
        <div className={`text-2xl font-bold ${isTimeUp ? 'text-error' : ''}`}>
          {formatTime(timeLeft)}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${getColor()} transition-all duration-1000 ${isTimeUp ? 'animate-pulse' : ''}`} 
          style={{ width: `${percentLeft}%` }}
        ></div>
      </div>
    </div>
  );
} 