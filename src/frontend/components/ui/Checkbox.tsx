import React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn } from '../../utils/cn';

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  error?: string;
}

export function Checkbox({ className, error, ...props }: CheckboxProps) {
  return (
    <div className="space-y-1">
      <CheckboxPrimitive.Root
        className={cn(
          'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn('flex items-center justify-center text-current')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
} 