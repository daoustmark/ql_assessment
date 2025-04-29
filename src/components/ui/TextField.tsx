"use client";

import React from 'react';

interface TextFieldProps {
  id: string;
  name: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  required?: boolean;
  className?: string;
  type?: string;
}

export function TextField({
  id,
  name,
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  multiline = false,
  rows = 3,
  required = false,
  className = '',
  type = 'text'
}: TextFieldProps) {
  const InputComponent = multiline 
    ? (props: any) => <textarea {...props} rows={rows} />
    : (props: any) => <input {...props} type={type} />;

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label htmlFor={id} className="label">
          <span className="label-text">
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </span>
        </label>
      )}
      <InputComponent
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={`input input-bordered w-full ${error ? 'input-error' : ''} ${multiline ? 'textarea' : ''}`}
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
    </div>
  );
} 