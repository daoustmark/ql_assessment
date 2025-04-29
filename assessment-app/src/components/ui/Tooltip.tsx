"use client";

import React, { useState, useRef, useEffect } from 'react';

type TooltipPosition = 'top' | 'right' | 'bottom' | 'left';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
  contentClassName?: string;
  disabled?: boolean;
}

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  className = '',
  contentClassName = '',
  disabled = false,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 mb-1',
    right: 'left-full top-1/2 transform -translate-y-1/2 translate-x-2 ml-1',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 translate-y-2 mt-1',
    left: 'right-full top-1/2 transform -translate-y-1/2 -translate-x-2 mr-1',
  };

  const arrowClasses = {
    top: 'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-neutral-700 border-r-transparent border-b-transparent border-l-transparent',
    right: 'left-0 top-1/2 transform -translate-y-1/2 -translate-x-full border-t-transparent border-r-neutral-700 border-b-transparent border-l-transparent',
    bottom: 'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-t-transparent border-r-transparent border-b-neutral-700 border-l-transparent',
    left: 'right-0 top-1/2 transform -translate-y-1/2 translate-x-full border-t-transparent border-r-transparent border-b-transparent border-l-neutral-700',
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`
            absolute z-50 px-2 py-1 text-sm font-medium text-white bg-neutral-700 rounded shadow-sm
            whitespace-nowrap pointer-events-none
            ${positionClasses[position]}
            ${contentClassName}
          `}
        >
          {content}
          <div 
            className={`
              absolute w-0 h-0 
              border-solid border-4
              ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
};

export { Tooltip }; 