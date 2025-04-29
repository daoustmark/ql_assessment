'use client';

import React, { useEffect, useState } from 'react';

/**
 * ThemeDebugger component to help diagnose theme and styling issues
 * This is a temporary component for development use only
 */
export const ThemeDebugger: React.FC = () => {
  const [cssVars, setCssVars] = useState<{[key: string]: string}>({});
  const [elementStyles, setElementStyles] = useState<{[key: string]: any}>({});
  
  useEffect(() => {
    // Get all CSS variables from root
    const rootStyles = getComputedStyle(document.documentElement);
    const vars: {[key: string]: string} = {};
    
    for (let i = 0; i < rootStyles.length; i++) {
      const prop = rootStyles[i];
      if (prop.startsWith('--')) {
        vars[prop] = rootStyles.getPropertyValue(prop);
      }
    }
    setCssVars(vars);
    
    // Get computed styles for key elements
    const stylesMap: {[key: string]: any} = {};
    
    // Check assessment container
    const assessmentContainer = document.querySelector('[data-theme="assessment"]');
    if (assessmentContainer) {
      stylesMap['assessment-container'] = {
        backgroundColor: getComputedStyle(assessmentContainer).backgroundColor,
        color: getComputedStyle(assessmentContainer).color,
        position: getComputedStyle(assessmentContainer).position,
      };
    }
    
    // Check radio buttons
    const radioButtons = document.querySelectorAll('.radio-button__checkmark');
    if (radioButtons.length > 0) {
      stylesMap['radio-button'] = {
        borderColor: getComputedStyle(radioButtons[0]).borderColor,
        backgroundColor: getComputedStyle(radioButtons[0]).backgroundColor,
        width: getComputedStyle(radioButtons[0]).width,
        height: getComputedStyle(radioButtons[0]).height,
      };
    }
    
    // Check progress bars
    const progressBars = document.querySelectorAll('.h-1\\.5');
    if (progressBars.length > 0) {
      stylesMap['progress-bar'] = {
        height: getComputedStyle(progressBars[0]).height,
        backgroundColor: getComputedStyle(progressBars[0]).backgroundColor,
        borderRadius: getComputedStyle(progressBars[0]).borderRadius,
      };
    }
    
    // Check question options
    const questionOptions = document.querySelectorAll('.question-option');
    if (questionOptions.length > 0) {
      stylesMap['question-option'] = {
        borderColor: getComputedStyle(questionOptions[0]).borderColor,
        backgroundColor: getComputedStyle(questionOptions[0]).backgroundColor,
        padding: getComputedStyle(questionOptions[0]).padding,
      };
    }
    
    setElementStyles(stylesMap);
  }, []);
  
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-auto" data-component="theme-debugger">
      <h3 className="text-lg font-bold mb-2">Theme Debugger</h3>
      <div className="mb-4">
        <h4 className="font-semibold mb-1">Element Computed Styles</h4>
        {Object.entries(elementStyles).map(([element, styles]) => (
          <div key={element} className="mb-2">
            <p className="font-medium text-sm">{element}:</p>
            <pre className="text-xs bg-gray-100 p-1 rounded">
              {JSON.stringify(styles, null, 2)}
            </pre>
          </div>
        ))}
      </div>
      <div>
        <h4 className="font-semibold mb-1">CSS Variables</h4>
        <pre className="text-xs bg-gray-100 p-1 rounded max-h-40 overflow-auto">
          {JSON.stringify(cssVars, null, 2)}
        </pre>
      </div>
      <button 
        className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-xs"
        onClick={() => {
          const debuggerElement = document.querySelector('[data-component="theme-debugger"]');
          if (debuggerElement) {
            debuggerElement.remove();
          }
        }}
      >
        Close
      </button>
    </div>
  );
};

export default ThemeDebugger; 