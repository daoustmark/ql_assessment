"use client";

import React from 'react';

interface RadioButtonProps {
  id: string;
  name: string;
  value: string;
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export function RadioButton({
  id,
  name,
  value,
  label,
  checked = false,
  onChange,
  className = '',
  disabled = false
}: RadioButtonProps) {
  return (
    <div className={`form-control ${className}`}>
      <label className="label cursor-pointer justify-start gap-2">
        <input 
          type="radio" 
          id={id}
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="radio radio-primary" 
        />
        <span className={`label-text ${disabled ? 'text-gray-400' : ''}`}>{label}</span>
      </label>
    </div>
  );
} 