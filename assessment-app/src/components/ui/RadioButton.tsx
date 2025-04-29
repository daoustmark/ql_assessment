import React from 'react';

interface RadioButtonProps {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  disabled?: boolean;
}

const RadioButton = ({
  id,
  name,
  value,
  checked,
  onChange,
  label,
  disabled = false,
}: RadioButtonProps) => {
  return (
    <div className="flex items-start space-x-3 py-2 group hover:transform hover:translate-x-1 transition-transform duration-slow">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="radio"
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only"
          aria-labelledby={`${id}-label`}
        />
        <label
          htmlFor={id}
          className={`
            flex items-center justify-center w-5 h-5 rounded-full
            border-2 border-neutral-300 bg-white
            peer-checked:border-secondary-600 peer-checked:bg-secondary-500 peer-checked:shadow-[0_0_0_2px_rgba(71,179,157,0.2)]
            hover:border-secondary-400 hover:bg-hover
            group-hover:shadow-card
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:hover:border-neutral-300 peer-disabled:hover:bg-white
            transition-all duration-base ease-in-out
            cursor-pointer
          `}
        >
          {checked && (
            <span className="block w-2 h-2 rounded-full bg-white transform scale-100 transition-transform animate-pulse"></span>
          )}
        </label>
        <div
          className="absolute inset-0 rounded-full opacity-0 peer-focus-visible:opacity-100 peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-accent peer-focus-visible:ring-opacity-50 transition-opacity duration-base"
          aria-hidden="true"
        />
      </div>
      {label && (
        <label
          id={`${id}-label`}
          htmlFor={id}
          className={`text-base text-neutral-700 leading-option cursor-pointer
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${checked ? 'font-medium text-neutral-800' : ''}
            group-hover:text-neutral-800 transition-colors duration-base
          `}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export { RadioButton }; 