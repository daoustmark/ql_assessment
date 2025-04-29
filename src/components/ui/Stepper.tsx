import React, { ReactNode } from 'react';

interface Step {
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface StepperProps {
  steps: Step[];
  activeStep: number;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function Stepper({ 
  steps, 
  activeStep, 
  className = '',
  orientation = 'horizontal' 
}: StepperProps) {
  if (orientation === 'vertical') {
    return (
      <div className={`flex flex-col ${className}`}>
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const isCompleted = index < activeStep;
          
          return (
            <div key={index} className="flex mb-6 last:mb-0">
              {/* Step connector line */}
              <div className="flex flex-col items-center">
                <div 
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 z-10
                    ${isActive 
                      ? 'bg-nomad-blue text-white border-nomad-blue' 
                      : isCompleted
                        ? 'bg-constant-green text-white border-constant-green'
                        : 'bg-white text-bespoke-navy-50 border-gray-300'}
                  `}
                >
                  {step.icon ? step.icon : (
                    isCompleted ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <span>{index + 1}</span>
                    )
                  )}
                </div>
                
                {index < steps.length - 1 && (
                  <div 
                    className={`w-0.5 h-full mt-2 
                      ${isCompleted ? 'bg-constant-green' : 'bg-gray-300'}`
                    }
                  />
                )}
              </div>
              
              {/* Step content */}
              <div className="ml-4 pb-8">
                <h3 
                  className={`font-medium ${
                    isActive ? 'text-bespoke-navy' : 
                    isCompleted ? 'text-constant-green' : 
                    'text-bespoke-navy-50'
                  }`}
                >
                  {step.label}
                </h3>
                {step.description && (
                  <p className="mt-1 text-sm text-bespoke-navy-50">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }
  
  // Horizontal orientation (default)
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div 
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2
                ${index === activeStep 
                  ? 'bg-nomad-blue text-white border-nomad-blue' 
                  : index < activeStep
                    ? 'bg-constant-green text-white border-constant-green'
                    : 'bg-white text-bespoke-navy-50 border-gray-300'}
              `}
            >
              {step.icon ? step.icon : (
                index < activeStep ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )
              )}
            </div>
            <span 
              className={`mt-2 text-xs font-medium max-w-[100px] text-center truncate
                ${index <= activeStep ? 'text-bespoke-navy' : 'text-bespoke-navy-50'}
              `}
            >
              {step.label}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div 
              className={`flex-1 h-0.5 mx-2
                ${index < activeStep ? 'bg-constant-green' : 'bg-gray-300'}
              `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
} 