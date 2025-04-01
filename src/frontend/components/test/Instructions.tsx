import React from 'react';
import { cn } from '../../utils/cn';

interface InstructionsProps {
  title: string;
  description: string;
  steps?: string[];
  warnings?: string[];
  className?: string;
}

export function Instructions({
  title,
  description,
  steps,
  warnings,
  className,
}: InstructionsProps) {
  return (
    <div className={cn('space-y-6 rounded-lg bg-white p-6 shadow-sm', className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>

      {steps && steps.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Instructions</h3>
          <ol className="list-decimal space-y-2 pl-5 text-gray-600">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {warnings && warnings.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-red-700">Important Notes</h3>
          <ul className="space-y-2 text-red-600">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 