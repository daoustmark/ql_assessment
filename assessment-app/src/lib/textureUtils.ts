/**
 * Texture Utilities
 * 
 * This file defines CSS classes and utilities for applying texture patterns
 * to components as specified in the UX improvement document.
 */

import { PATTERNS } from '../../public/images/textures';

// CSS for the background textures
export const textureStyles = `
  .bg-texture {
    background-color: #FFF;
    background-image: url(${PATTERNS.GRAIN});
    background-size: 16px 16px;
    background-repeat: repeat;
    background-blend-mode: overlay;
    background-opacity: 0.04;
  }
  
  .bg-texture-header {
    background-image: url(${PATTERNS.DIAGONAL});
    background-size: 20px 20px;
    background-repeat: repeat;
    background-blend-mode: overlay;
    background-opacity: 0.08;
  }
  
  .bg-texture-section {
    background-color: #F2F7F9;
    background-image: url(${PATTERNS.TOPOGRAPHIC});
    background-size: cover;
    background-repeat: no-repeat;
    background-blend-mode: overlay;
    background-opacity: 0.02;
  }
`;

// Function to inject texture styles into the document
export const injectTextureStyles = () => {
  if (typeof document !== 'undefined') {
    const styleElement = document.createElement('style');
    styleElement.textContent = textureStyles;
    document.head.appendChild(styleElement);
  }
};

// Hook to use in a client component to inject texture styles
export const useTextureStyles = () => {
  if (typeof window !== 'undefined') {
    // Run only on client side
    if (!document.getElementById('texture-styles')) {
      const styleElement = document.createElement('style');
      styleElement.id = 'texture-styles';
      styleElement.textContent = textureStyles;
      document.head.appendChild(styleElement);
    }
  }
};

export default {
  textureStyles,
  injectTextureStyles,
  useTextureStyles,
}; 