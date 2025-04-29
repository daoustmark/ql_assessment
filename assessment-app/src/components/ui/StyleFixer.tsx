'use client';

import React, { useEffect } from 'react';

/**
 * StyleFixer component that fixes styling issues by injecting CSS rules
 * This addresses design system implementation issues
 */
export const StyleFixer: React.FC = () => {
  useEffect(() => {
    console.log('StyleFixer component mounted and running!');
    console.log('Attempting to inject styles...');

    // Define the CSS variables directly on :root to ensure they're available first
    const rootStyles = document.createElement('style');
    rootStyles.id = 'root-vars';
    rootStyles.textContent = `
      :root {
        --color-primary: #3B6E8F;
        --color-secondary: #47B39D;
        --color-accent: #EC6B56;
        --color-background-main: #F2F7F9;
        --color-background-card: #FFFFFF;
        --color-background-subtle: #E0E7EC;
        --color-text-heading: #202A37;
        --color-text-body: #3E4D5C;
        --color-text-light: #6E7A89;
        --color-interactive-unselected: #D8E1E8;
        --color-interactive-selected: #47B39D;
        --color-interactive-hover: #EBF5F2;
        --shadow-card: 0 2px 8px rgba(71, 179, 157, 0.08);
        --shadow-floating: 0 4px 12px rgba(59, 110, 143, 0.12);
        --shadow-focus: 0 0 0 2px rgba(236, 107, 86, 0.2);
      }
    `;
    
    // Create style element to inject CSS fixes
    const styleElement = document.createElement('style');
    styleElement.id = 'style-fixes';
    
    // CSS fixes for the assessment UI
    styleElement.textContent = `
      /* Force theme for assessment pages */
      [data-theme="assessment"] {
        --color-background-main: #F2F7F9 !important;
        --color-background-card: #FFFFFF !important;
        --color-background-subtle: #E0E7EC !important;
        --color-text-heading: #202A37 !important;
        --color-text-body: #3E4D5C !important;
        --color-text-light: #6E7A89 !important;
        --color-interactive-unselected: #D8E1E8 !important;
        --color-interactive-selected: #47B39D !important;
        --color-interactive-hover: #EBF5F2 !important;
        --shadow-card: 0 2px 8px rgba(71, 179, 157, 0.08) !important;
        --shadow-floating: 0 4px 12px rgba(59, 110, 143, 0.12) !important;
        --shadow-focus: 0 0 0 2px rgba(236, 107, 86, 0.2) !important;
        color: var(--color-text-body) !important;
        background-color: var(--color-background-main) !important;
        font-family: Inter, "SF Pro Display", -apple-system, sans-serif !important;
      }
      
      /* Make the question container look better */
      [data-theme="assessment"] .bg-white.rounded-lg,
      [data-theme="assessment"] .shadow-floating {
        background-color: var(--color-background-card) !important;
        border-radius: 12px !important;
        box-shadow: var(--shadow-card) !important;
        border: 1px solid var(--color-background-subtle) !important;
        overflow: hidden !important;
      }
      
      /* Add proper spacing to question container */
      [data-theme="assessment"] .pb-6 {
        padding-bottom: 28px !important;
      }
      
      [data-theme="assessment"] .mb-7 {
        margin-bottom: 32px !important;
      }
      
      /* Fix the question text */
      [data-theme="assessment"] .text-question {
        font-size: 18px !important;
        font-weight: 600 !important;
        line-height: 1.5 !important;
        letter-spacing: -0.1px !important;
        color: var(--color-text-heading) !important;
        margin-bottom: 16px !important;
      }
      
      /* Completely overhaul the radio button styling */
      [data-theme="assessment"] .question-option {
        border: 2px solid var(--color-interactive-unselected) !important;
        border-radius: 12px !important;
        background-color: var(--color-background-card) !important;
        padding: 20px 24px !important;
        margin-bottom: 20px !important;
        cursor: pointer !important;
        transition: all 200ms ease-in-out !important;
        display: flex !important;
        align-items: center !important;
      }
      
      /* Force the radio button to be round and properly styled */
      [data-theme="assessment"] .radio-button__checkmark {
        height: 20px !important;
        width: 20px !important;
        min-width: 20px !important;
        border: 2px solid var(--color-interactive-unselected) !important;
        border-radius: 50% !important;
        background-color: var(--color-background-card) !important;
        position: relative !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        flex-shrink: 0 !important;
        margin-right: 16px !important;
        box-sizing: border-box !important;
      }
      
      /* Add the inner circle for selected state */
      [data-theme="assessment"] .radio-button__checkmark::after {
        content: '';
        display: none;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: white;
      }
      
      /* Style for selected radio button */
      [data-theme="assessment"] [aria-pressed="true"] .radio-button__checkmark {
        background-color: var(--color-interactive-selected) !important;
        border-color: var(--color-interactive-selected) !important;
      }
      
      /* Show the inner circle when selected */
      [data-theme="assessment"] [aria-pressed="true"] .radio-button__checkmark::after {
        display: block !important;
      }
      
      /* Fix the option text */
      [data-theme="assessment"] .question-option span {
        font-size: 16px !important;
        font-weight: 400 !important;
        line-height: 1.4 !important;
        color: var(--color-text-body) !important;
      }
      
      /* Add selected state styling for the option text */
      [data-theme="assessment"] [aria-pressed="true"] span {
        font-weight: 600 !important;
      }
      
      /* Hover effects for questions */
      [data-theme="assessment"] .question-option:hover {
        border-color: var(--color-interactive-selected) !important;
        background-color: var(--color-interactive-hover) !important;
        transform: translateY(-2px) !important;
        box-shadow: var(--shadow-card) !important;
      }
      
      /* Force .space-y-5 to have proper spacing */
      [data-theme="assessment"] .space-y-5 > * + * {
        margin-top: 20px !important;
      }
      
      /* Fix the spacing between the question and options */
      [data-theme="assessment"] .mt-8 {
        margin-top: 32px !important;
      }
      
      /* Progress bar styling fixes */
      [data-theme="assessment"] .h-1\\.5 {
        height: 6px !important;
        border-radius: 3px !important;
        background-color: var(--color-interactive-unselected) !important;
        overflow: hidden !important;
        margin-bottom: 8px !important;
      }
      
      [data-theme="assessment"] .h-1\\.5 > div {
        background: linear-gradient(135deg, #3B6E8F 0%, #47B39D 100%) !important;
        border-radius: 3px !important;
        transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      /* Fix progress percentage display NaN% */
      [data-theme="assessment"] .flex.justify-between span,
      [data-theme="assessment"] .text-primary-700 {
        color: var(--color-text-body) !important;
        font-size: 14px !important;
        font-weight: 500 !important;
      }
      
      /* Fix heading sizes */
      [data-theme="assessment"] h1 {
        font-size: 24px !important;
        line-height: 1.4 !important;
      }
      
      [data-theme="assessment"] h2 {
        font-size: 20px !important;
        line-height: 1.4 !important;
      }
      
      [data-theme="assessment"] h3 {
        font-size: 18px !important;
        line-height: 1.4 !important;
      }
      
      /* Reset assessment background styling */
      [data-theme="assessment"].assessment-bg {
        position: relative !important;
        background-color: var(--color-background-main) !important;
        background-image: none !important;
        padding: 32px 16px 64px 16px !important;
      }
      
      /* Add proper texture to assessment background */
      [data-theme="assessment"].assessment-bg::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-image: url('/images/textures/grain.png');
        background-size: 16px 16px;
        background-repeat: repeat;
        opacity: 0.04;
        pointer-events: none;
        z-index: -1;
      }
      
      /* Fix "Next" button styling */
      [data-theme="assessment"] .bg-gradient-primary {
        background: linear-gradient(135deg, #3B6E8F 0%, #47B39D 100%) !important;
        color: white !important;
        border-radius: 8px !important;
        padding: 12px 24px !important;
        font-weight: 600 !important;
        letter-spacing: 2px !important;
        height: 48px !important;
      }
      
      /* Fix button styling */
      [data-theme="assessment"] button:not([disabled]) {
        transition: all 200ms ease-in-out !important;
      }
      
      [data-theme="assessment"] button:not([disabled]):hover {
        transform: translateY(-2px) !important;
        box-shadow: var(--shadow-floating) !important;
      }
      
      [data-theme="assessment"] button:not([disabled]):active {
        transform: scale(0.98) !important;
      }
    `;
    
    // Apply the styles in the correct order - first variables, then fixes
    if (!document.getElementById('root-vars')) {
      document.head.appendChild(rootStyles);
      console.log('Root variables style element injected with ID: root-vars');
    } else {
      console.log('Root variables style element already exists');
    }
    
    if (!document.getElementById('style-fixes')) {
      document.head.appendChild(styleElement);
      console.log('Style fixes element injected with ID: style-fixes');
    } else {
      console.log('Style fixes element already exists');
    }
    
    // Cleanup on unmount
    return () => {
      console.log('StyleFixer component unmounting...');
      
      const styleElement = document.getElementById('style-fixes');
      if (styleElement) {
        document.head.removeChild(styleElement);
        console.log('Style fixes element removed');
      }
      
      const rootVarsElement = document.getElementById('root-vars');
      if (rootVarsElement) {
        document.head.removeChild(rootVarsElement);
        console.log('Root variables element removed');
      }
    };
  }, []);
  
  return null; // This component doesn't render anything
};

export default StyleFixer; 