'use client';

import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { Icon } from './Icon';
import { Button } from './Button';
import { usePrefersReducedMotion } from '@/lib/animationUtils';

interface SuccessMessageProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function SuccessMessage({
  title,
  message,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: SuccessMessageProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [showConfetti, setShowConfetti] = useState(false);
  
  useEffect(() => {
    // Only show animation if user doesn't prefer reduced motion
    if (!prefersReducedMotion) {
      setShowConfetti(true);
      
      // Hide confetti after animation completes
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [prefersReducedMotion]);
  
  return (
    <div className={`relative ${className}`}>
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-20px] left-[10%] animate-celebrate delay-100">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
          </div>
          <div className="absolute top-[-30px] left-[20%] animate-celebrate delay-300">
            <div className="w-3 h-3 rounded-full bg-secondary"></div>
          </div>
          <div className="absolute top-[-25px] left-[30%] animate-celebrate delay-150">
            <div className="w-5 h-5 rounded-full bg-accent"></div>
          </div>
          <div className="absolute top-[-15px] left-[40%] animate-celebrate delay-200">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
          </div>
          <div className="absolute top-[-20px] left-[50%] animate-celebrate delay-250">
            <div className="w-6 h-6 rounded-full bg-secondary"></div>
          </div>
          <div className="absolute top-[-30px] left-[60%] animate-celebrate delay-100">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
          </div>
          <div className="absolute top-[-25px] left-[70%] animate-celebrate delay-350">
            <div className="w-5 h-5 rounded-full bg-primary"></div>
          </div>
          <div className="absolute top-[-15px] left-[80%] animate-celebrate delay-200">
            <div className="w-4 h-4 rounded-full bg-secondary"></div>
          </div>
          <div className="absolute top-[-20px] left-[90%] animate-celebrate delay-300">
            <div className="w-3 h-3 rounded-full bg-accent"></div>
          </div>
        </div>
      )}
      
      <Card 
        className="max-w-md mx-auto"
        variant="raised"
        elevation="floating"
        padding="large"
        withTexture={true}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mb-6 animate-pulse">
            <Icon name="success" size="large" color="#47B39D" />
          </div>
          
          <h2 className="text-2xl font-bold text-heading mb-4">
            {title}
          </h2>
          
          <p className="text-body mb-8">
            {message}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {actionLabel && onAction && (
              <Button 
                variant="primary"
                onClick={onAction}
                className="w-full"
              >
                {actionLabel}
              </Button>
            )}
            
            {secondaryActionLabel && onSecondaryAction && (
              <Button 
                variant="secondary"
                onClick={onSecondaryAction}
                className="w-full"
              >
                {secondaryActionLabel}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
} 