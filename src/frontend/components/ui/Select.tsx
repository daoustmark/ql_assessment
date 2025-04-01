import React from 'react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { cn } from '../../utils/cn';

interface SelectProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Root> {
  error?: string;
}

interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  error?: string;
}

interface SelectContentProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> {}

interface SelectItemProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> {}

interface SelectValueProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Value> {}

interface SelectLabelProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label> {}

interface SelectGroupProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Group> {}

interface SelectSeparatorProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator> {}

export function Select({ children, ...props }: SelectProps) {
  return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>;
}

export function SelectTrigger({ className, error, children, ...props }: SelectTriggerProps) {
  return (
    <div className="space-y-1">
      <SelectPrimitive.Trigger
        className={cn(
          'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      >
        {children}
      </SelectPrimitive.Trigger>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function SelectContent({ className, children, position = 'popper', ...props }: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          position === 'popper' &&
            'data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1',
          className
        )}
        position={position}
        {...props}
      >
        {children}
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }: SelectItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
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
        </SelectPrimitive.ItemIndicator>
      </span>
      {children}
    </SelectPrimitive.Item>
  );
}

export function SelectValue({ className, children, ...props }: SelectValueProps) {
  return (
    <SelectPrimitive.Value
      className={cn('text-sm', className)}
      {...props}
    >
      {children}
    </SelectPrimitive.Value>
  );
}

export function SelectLabel({ className, children, ...props }: SelectLabelProps) {
  return (
    <SelectPrimitive.Label
      className={cn('py-1.5 pl-8 pr-2 text-sm font-semibold', className)}
      {...props}
    >
      {children}
    </SelectPrimitive.Label>
  );
}

export function SelectGroup({ className, children, ...props }: SelectGroupProps) {
  return (
    <SelectPrimitive.Group
      className={cn('px-1 py-1.5', className)}
      {...props}
    >
      {children}
    </SelectPrimitive.Group>
  );
}

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <SelectPrimitive.Separator
      className={cn('-mx-1 my-1 h-px bg-muted', className)}
      {...props}
    />
  );
} 