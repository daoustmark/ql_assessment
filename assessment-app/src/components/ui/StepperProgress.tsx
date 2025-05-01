import React from 'react';

interface StepperProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function StepperProgress({ steps, currentStep, className = '' }: StepperProgressProps) {
  return (
    <div className={`w-full py-4 ${className}`}>
      <div className="relative flex items-center justify-between">
        {/* Connecting line background - always gray */}
        <div className="absolute left-0 right-0 top-5 h-1 bg-gray-200 -z-10"></div>
        
        {/* Progress line overlay - colored for completed steps */}
        <div 
          className="absolute left-0 top-5 h-1 bg-gradient-to-r from-nomad-blue to-nomad-blue-600 -z-5 transition-all duration-500 ease-in-out"
          style={{ 
            width: `${currentStep === 0 ? 0 : (currentStep / (steps.length - 1)) * 100}%`,
            // Extra width to cover half of the last circle
            ...(currentStep > 0 && currentStep < steps.length && { width: `calc(${(currentStep / (steps.length - 1)) * 100}% + 1rem)` })
          }}
        ></div>
        
        {steps.map((step, index) => {
          // Determine if this step is completed, current, or upcoming
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          
          // Determine the appropriate styles based on step status
          const circleClasses = `
            flex items-center justify-center rounded-full 
            ${isCompleted ? 'bg-nomad-blue text-white shadow-md' : ''}
            ${isCurrent ? 'bg-white text-nomad-blue-700 ring-2 ring-nomad-blue shadow-lg scale-110' : ''}
            ${isUpcoming ? 'bg-white text-gray-400 border-2 border-gray-200' : ''}
            transition-all duration-300 ease-in-out w-10 h-10 text-sm font-semibold z-10
          `;
          
          const textClasses = `
            text-xs font-medium mt-2 max-w-[80px] text-center transition-all duration-300 ease-in-out
            ${isCompleted ? 'text-nomad-blue' : ''}
            ${isCurrent ? 'text-nomad-blue-700 font-semibold scale-105' : ''}
            ${isUpcoming ? 'text-gray-500' : ''}
          `;
          
          return (
            <div className="flex flex-col items-center" key={index}>
              <div className={circleClasses}>
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              
              <div className="h-14 flex items-start justify-center">
                <span className={textClasses}>{step}</span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Section info */}
      <div className="flex justify-between text-sm mt-2 text-gray-600">
        <div>Section {currentStep + 1} of {steps.length}</div>
        <div>{Math.round((currentStep / (steps.length - 1)) * 100)}% complete</div>
      </div>
    </div>
  );
} 