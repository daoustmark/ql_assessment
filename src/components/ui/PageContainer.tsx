import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function PageContainer({ 
  children, 
  title, 
  subtitle,
  className = ''
}: PageContainerProps) {
  return (
    <div className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {title && (
        <div className="mb-8 border-b border-bespoke-navy-25 pb-5">
          <h1 className="text-3xl font-bold text-bespoke-navy">{title}</h1>
          {subtitle && <p className="mt-2 text-xl text-bespoke-navy-75">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
} 