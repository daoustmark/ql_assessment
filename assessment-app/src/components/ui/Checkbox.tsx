import React from 'react';

interface CheckboxProps {
  id: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
  indeterminate?: boolean;
}

const Checkbox = ({
  id,
  name,
  checked,
  onChange,
  label,
  disabled = false,
  indeterminate = false,
}: CheckboxProps) => {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className="flex items-start space-x-3 py-2 group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          ref={checkboxRef}
          type="checkbox"
          id={id}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          aria-labelledby={`${id}-label`}
        />
        <label
          htmlFor={id}
          className={`
            flex items-center justify-center w-5 h-5 rounded-md
            border-2 border-neutral-300 bg-white
            peer-checked:border-secondary-600 peer-checked:bg-secondary-500 peer-checked:shadow-[0_0_0_2px_rgba(71,179,157,0.2)]
            hover:border-secondary-400 hover:bg-secondary-50
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:hover:border-neutral-300 peer-disabled:hover:bg-white
            transition-all duration-150 ease-in-out
            cursor-pointer
          `}
        >
          {checked && !indeterminate && (
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path 
                d="M10 3L4.5 8.5L2 6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          )}
          {indeterminate && (
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path 
                d="M3 6H9" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </svg>
          )}
        </label>
        <div
          className="absolute inset-0 rounded-md opacity-0 peer-focus-visible:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-secondary-500"
          aria-hidden="true"
        />
      </div>
      {label && (
        <label
          id={`${id}-label`}
          htmlFor={id}
          className={`text-base text-neutral-700 leading-normal cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${checked ? 'font-medium text-neutral-800' : ''}
          `}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export { Checkbox }; 