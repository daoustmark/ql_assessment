"use client";

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  bodyClassName?: string;
}

export function Card({ children, title, className = '', bodyClassName = '' }: CardProps) {
  return (
    <div className={`card bg-base-100 shadow-xl ${className}`}>
      {title && (
        <div className="card-title p-4 border-b">
          {title}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
} 