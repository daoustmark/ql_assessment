import React from 'react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  labels = [],
  className = ''
}: ProgressIndicatorProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div 
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full 
                  ${step < currentStep 
                    ? 'bg-constant-green text-white' 
                    : step === currentStep 
                      ? 'bg-nomad-blue text-white' 
                      : 'bg-gray-200 text-bespoke-navy-50'}
                  transition-colors duration-200
                `}
              >
                {step < currentStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{step}</span>
                )}
              </div>
              {labels[step - 1] && (
                <span 
                  className={`
                    mt-2 text-xs font-medium
                    ${step <= currentStep ? 'text-bespoke-navy' : 'text-bespoke-navy-50'}
                  `}
                >
                  {labels[step - 1]}
                </span>
              )}
            </div>
            
            {step < totalSteps && (
              <div 
                className={`
                  flex-1 h-1 mx-2
                  ${step < currentStep ? 'bg-constant-green' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 