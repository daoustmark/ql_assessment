import React from 'react';
import { Card } from './Card';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
  imageUrl,
  imageAlt = 'Empty state illustration',
}: EmptyStateProps) {
  return (
    <Card 
      className={`w-full ${className}`}
      variant="flat"
      padding="large"
      withTexture={true}
    >
      <div className="flex flex-col items-center justify-center py-8 text-center">
        {imageUrl && (
          <div className="mb-6">
            <img 
              src={imageUrl} 
              alt={imageAlt} 
              className="max-w-[200px] h-auto opacity-90"
            />
          </div>
        )}
        
        {icon && (
          <div className="mb-6 text-neutral-400">
            {icon}
          </div>
        )}
        
        <h3 className="text-xl font-semibold text-neutral-800 mb-2">
          {title}
        </h3>
        
        {description && (
          <p className="text-neutral-600 max-w-md mb-6">
            {description}
          </p>
        )}
        
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
    </Card>
  );
} 