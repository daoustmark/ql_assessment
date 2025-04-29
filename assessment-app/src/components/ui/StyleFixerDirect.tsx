'use client';

import React, { useEffect } from 'react';

/**
 * StyleFixerDirect - Critical CSS injector component
 * 
 * This component directly injects essential styles into the DOM 
 * with high specificity to ensure proper rendering of radio buttons
 * and other question elements.
 */
export const StyleFixerDirect: React.FC = () => {
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.id = 'emergency-styles';
    
    // Critical CSS styles with high specificity
    styleElement.textContent = `
      /* Radio button styles */
      .radio-button {
        display: inline-flex !important;
        align-items: center !important;
        position: relative !important;
        cursor: pointer !important;
        user-select: none !important;
      }
      
      .radio-button__checkmark {
        width: 20px !important;
        height: 20px !important;
        border: 2px solid #6b7280 !important;
        border-radius: 50% !important;
        display: inline-block !important;
        position: relative !important;
        margin-right: 8px !important;
      }
      
      .radio-button[aria-checked="true"] .radio-button__checkmark {
        border-color: #2563eb !important;
      }
      
      .radio-button[aria-checked="true"] .radio-button__checkmark::after {
        content: "" !important;
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 10px !important;
        height: 10px !important;
        border-radius: 50% !important;
        background-color: #2563eb !important;
      }
      
      /* Question options styles */
      .question-option {
        border: 2px solid #e5e7eb !important;
        border-radius: 0.5rem !important;
        padding: 1rem !important;
        margin-bottom: 0.5rem !important;
        cursor: pointer !important;
        transition: border-color 0.2s ease !important;
      }
      
      .question-option:hover {
        border-color: #d1d5db !important;
      }
      
      .question-option.selected {
        border-color: #2563eb !important;
        background-color: rgba(37, 99, 235, 0.05) !important;
      }
    `;
    
    // Add style element to head
    document.head.appendChild(styleElement);
    
    // Cleanup function
    return () => {
      const el = document.getElementById('emergency-styles');
      if (el) {
        document.head.removeChild(el);
      }
    };
  }, []);
  
  return null;
};

export default StyleFixerDirect; 