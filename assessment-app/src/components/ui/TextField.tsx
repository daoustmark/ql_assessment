import React from 'react';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  id: string;
  label?: string;
  helperText?: string;
  error?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'underlined' | 'outlined';
}

const TextField = ({
  id,
  label,
  helperText,
  error,
  prefix,
  suffix,
  fullWidth = true,
  variant = 'underlined',
  className = '',
  disabled,
  ...props
}: TextFieldProps) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = React.useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  const variantClasses = {
    underlined: 'border-b-2 rounded-none px-0 py-2 focus:ring-0 placeholder-neutral-400',
    outlined: 'border rounded-md px-3 py-2 focus:ring-2 focus:ring-offset-0 placeholder-neutral-400',
  };

  return (
    <div className={`${fullWidth ? 'w-full' : 'w-auto'} ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className={`block text-sm font-medium mb-1 transition-colors duration-150
            ${error ? 'text-error-600' : 'text-neutral-700'}
            ${disabled ? 'opacity-50' : ''}
          `}
        >
          {label}
        </label>
      )}
      
      <div className={`relative flex items-center ${error ? 'text-error-600' : ''}`}>
        {prefix && (
          <div className="absolute left-0 flex items-center pl-3 pointer-events-none text-neutral-500">
            {prefix}
          </div>
        )}
        
        <input
          ref={inputRef}
          id={id}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`
            w-full bg-transparent transition-colors duration-150
            ${variantClasses[variant]}
            ${prefix ? 'pl-8' : ''}
            ${suffix ? 'pr-8' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error 
              ? 'border-error-500 focus:border-error-500' 
              : isFocused 
                ? 'border-secondary-500 focus:border-secondary-500' 
                : 'border-neutral-300 hover:border-neutral-400'
            }
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        
        {suffix && (
          <div className="absolute right-0 flex items-center pr-3 pointer-events-none text-neutral-500">
            {suffix}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div 
          id={error ? `${id}-error` : `${id}-helper`}
          className={`mt-1 text-sm ${error ? 'text-error-600' : 'text-neutral-500'}`}
        >
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export { TextField }; 