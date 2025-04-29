'use client';

import React, { useEffect } from 'react';
import { useTextureStyles } from '@/lib/textureUtils';

interface TextureProviderProps {
  children: React.ReactNode;
}

/**
 * TextureProvider injects the necessary texture styles for background patterns
 * Used in the app layout to ensure textures are available throughout the application
 */
export function TextureProvider({ children }: TextureProviderProps) {
  // Inject texture styles on component mount
  useEffect(() => {
    // This will run only on the client side
    const styleElement = document.createElement('style');
    styleElement.id = 'texture-styles';
    styleElement.textContent = `
      .bg-texture {
        background-color: #FFF;
        background-image: url('/images/textures/grain.png');
        background-size: 16px 16px;
        background-repeat: repeat;
        background-blend-mode: multiply;
        opacity: 1;
      }
      
      .bg-texture-header {
        position: relative;
      }
      
      .bg-texture-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('/images/textures/diagonal.png');
        background-size: 20px 20px;
        background-repeat: repeat;
        opacity: 0.08;
        pointer-events: none;
        z-index: 1;
      }
      
      .bg-texture-section {
        position: relative;
      }
      
      .bg-texture-section::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('/images/textures/topographic.png');
        background-size: cover;
        background-repeat: no-repeat;
        opacity: 0.02;
        pointer-events: none;
        z-index: 0;
      }
      
      /* Default page background */
      body {
        background-color: #F2F7F9;
        position: relative;
        opacity: 1;
      }
      
      body::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('/images/textures/grain.png');
        background-size: 16px 16px;
        background-repeat: repeat;
        opacity: 0.04; /* Correct 4% opacity for the texture */
        pointer-events: none;
        z-index: -1;
      }
      
      /* Assessment background specific styling */
      .assessment-bg {
        position: relative;
        /* Use the background from CSS variables but ensure no image is directly applied */
        background-color: var(--color-background-main);
        background-image: none;
      }
      
      .assessment-bg::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('/images/textures/grain.png');
        background-size: 16px 16px;
        background-repeat: repeat;
        opacity: 0.04; /* Correct 4% opacity for the texture */
        pointer-events: none;
        z-index: -1;
      }
    `;
    
    if (!document.getElementById('texture-styles')) {
      document.head.appendChild(styleElement);
    }
    
    return () => {
      if (document.getElementById('texture-styles')) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);
  
  return <>{children}</>;
} 