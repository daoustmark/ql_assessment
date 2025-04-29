import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'flat' | 'raised' | 'interactive';
  padding?: 'none' | 'small' | 'medium' | 'large';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  withDivider?: boolean;
  withTexture?: boolean;
  elevation?: 'base' | 'floating' | 'focus';
}

const Card = ({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
  header,
  footer,
  withDivider = false,
  withTexture = false,
  elevation = 'base',
}: CardProps) => {
  const variantClasses = {
    default: 'bg-white rounded-lg',
    flat: 'bg-white rounded-lg border border-neutral-200',
    raised: 'bg-white rounded-lg',
    interactive: 'bg-white rounded-lg hover:shadow-floating transition-all duration-base cursor-pointer transform hover:scale-[1.01]',
  };

  const paddingClasses = {
    none: '',
    small: 'p-4',
    medium: 'p-6',
    large: 'p-8',
  };

  const elevationClasses = {
    base: 'shadow-card',
    floating: 'shadow-floating',
    focus: 'shadow-focus',
  };

  // Background texture class for subtle patterns
  const textureClass = withTexture ? 'bg-texture' : '';

  return (
    <div 
      className={`
        ${variantClasses[variant]} 
        ${elevationClasses[elevation]} 
        ${textureClass}
        overflow-hidden 
        transition-all duration-base
        ${className}
      `}
    >
      {header && (
        <div 
          className={`
            ${paddingClasses[padding]} 
            ${withDivider ? 'border-b border-neutral-200' : ''} 
            ${withTexture ? 'bg-texture-header' : ''}
          `}
        >
          {header}
        </div>
      )}
      
      <div className={paddingClasses[padding]}>
        {children}
      </div>
      
      {footer && (
        <div 
          className={`
            ${paddingClasses[padding]} 
            ${withDivider ? 'border-t border-neutral-200' : ''}
          `}
        >
          {footer}
        </div>
      )}
    </div>
  );
};

export { Card }; 