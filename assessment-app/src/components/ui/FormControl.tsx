import React from 'react';

interface FormControlProps {
  id: string;
  label: string;
  children: React.ReactNode;
  helperText?: string;
  error?: string;
  required?: boolean;
  className?: string;
  spacing?: 'tight' | 'normal' | 'loose';
}

const FormControl = ({
  id,
  label,
  children,
  helperText,
  error,
  required = false,
  className = '',
  spacing = 'normal',
}: FormControlProps) => {
  const spacingClasses = {
    tight: 'mb-3',
    normal: 'mb-5',
    loose: 'mb-8',
  };

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      <label 
        htmlFor={id}
        className={`block text-sm font-medium mb-2
          ${error ? 'text-error-600' : 'text-neutral-700'}
        `}
      >
        {label}
        {required && <span className="ml-1 text-error-500">*</span>}
      </label>
      
      {children}
      
      {(error || helperText) && (
        <div 
          id={error ? `${id}-error` : `${id}-helper`}
          className={`mt-1.5 text-sm ${error ? 'text-error-600' : 'text-neutral-500'}`}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export default FormControl; 