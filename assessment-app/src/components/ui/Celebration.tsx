import React, { useEffect, useState } from 'react';
import { colors } from '@/lib/designSystem';

interface CelebrationProps {
  type?: 'confetti' | 'checkmark' | 'sparkle';
  duration?: number; // in milliseconds
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onComplete?: () => void;
}

export function Celebration({
  type = 'confetti',
  duration = 2000,
  size = 'md',
  color,
  onComplete
}: CelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Auto-hide after duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) onComplete();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onComplete]);
  
  if (!isVisible) return null;
  
  const sizeMap = {
    sm: { width: '100px', height: '100px' },
    md: { width: '200px', height: '200px' },
    lg: { width: '300px', height: '300px' }
  };
  
  const fillColor = color || colors.secondary;
  
  const renderCelebration = () => {
    switch (type) {
      case 'confetti':
        return (
          <div className="confetti-container" style={sizeMap[size]}>
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className="confetti" 
                style={{
                  backgroundColor: i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent,
                  left: `${Math.random() * 100}%`,
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${Math.random() * 3 + 2}s`
                }}
              />
            ))}
          </div>
        );
      case 'checkmark':
        return (
          <div className="checkmark-container flex items-center justify-center" style={sizeMap[size]}>
            <svg 
              viewBox="0 0 52 52" 
              className="checkmark animate-checkmark"
              style={{ width: sizeMap[size].width, height: sizeMap[size].height }}
            >
              <circle 
                className="checkmark__circle" 
                cx="26" cy="26" r="25" 
                fill="none" 
                stroke={fillColor} 
                strokeWidth="2" 
                strokeMiterlimit="10" 
              />
              <path 
                className="checkmark__check" 
                fill="none" 
                stroke={fillColor} 
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round" 
                strokeMiterlimit="10" 
                d="M14.1 27.2L22.5 35.7L37.9 19.8" 
              />
            </svg>
          </div>
        );
      case 'sparkle':
        return (
          <div className="sparkle-container" style={sizeMap[size]}>
            {[...Array(15)].map((_, i) => (
              <div 
                key={i} 
                className="sparkle" 
                style={{
                  backgroundColor: i % 2 === 0 ? colors.primary : colors.secondary,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 8 + 4}px`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  animationDuration: `${Math.random() * 2 + 1}s`
                }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
      {renderCelebration()}
    </div>
  );
} 