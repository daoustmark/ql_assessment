/**
 * Animation Utilities
 * 
 * This file provides utility functions and hooks for consistent animations
 * throughout the application, with respect for user preferences.
 */

'use client';

import { useEffect, useState } from 'react';

// Check if user prefers reduced motion
export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  
  return prefersReducedMotion;
};

// Animation durations with fallbacks for reduced motion
export const getAnimationDuration = (prefersReducedMotion: boolean, duration: number) => {
  return prefersReducedMotion ? 0 : duration;
};

// Animation classes
export const getAnimationClass = (animationName: string, prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) return '';
  return `animate-${animationName}`;
};

// Transition directions for question changes
export type TransitionDirection = 'next' | 'prev' | 'none';

// Get animation class based on transition direction
export const getTransitionClass = (
  direction: TransitionDirection,
  prefersReducedMotion: boolean
): string => {
  if (prefersReducedMotion) return '';
  
  switch (direction) {
    case 'next':
      return 'animate-slide-in-right';
    case 'prev':
      return 'animate-slide-in-left';
    case 'none':
    default:
      return 'animate-fade-in';
  }
};

// Micro-animations for selection feedback
export const getSelectionFeedbackClass = (isSelected: boolean, prefersReducedMotion: boolean): string => {
  if (prefersReducedMotion || !isSelected) return '';
  return 'animate-pulse';
};

// CSS keyframes for animations (to be injected in the TextureProvider or elsewhere)
export const animationKeyframes = `
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes slideInRight {
    0% { transform: translateX(20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInLeft {
    0% { transform: translateX(-20px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideInUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
  
  /* Completion celebration animation */
  @keyframes celebrate {
    0% { transform: translateY(0) scale(1); }
    25% { transform: translateY(-20px) scale(1.1); }
    50% { transform: translateY(0) scale(1); }
    75% { transform: translateY(-10px) scale(1.05); }
    100% { transform: translateY(0) scale(1); }
  }
`;

export default {
  usePrefersReducedMotion,
  getAnimationDuration,
  getAnimationClass,
  getTransitionClass,
  getSelectionFeedbackClass,
  animationKeyframes,
}; 