import React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { cn } from '../../utils/cn';

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  error?: string;
}

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  error?: string;
}

export function RadioGroup({ className, error, ...props }: RadioGroupProps) {
  return (
    <div className="space-y-1">
      <RadioGroupPrimitive.Root
        className={cn('grid gap-2', className)}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function RadioGroupItem({ className, error, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        error && 'border-red-500 focus-visible:ring-red-500',
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <div className="h-2.5 w-2.5 rounded-full bg-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
} 