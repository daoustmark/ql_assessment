import React from 'react';
import { cn } from '../../utils/cn';

interface QuestionContainerProps {
  questionNumber: number;
  totalQuestions: number;
  children: React.ReactNode;
  className?: string;
}

export function QuestionContainer({
  questionNumber,
  totalQuestions,
  children,
  className,
}: QuestionContainerProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex items-center justify-between border-b pb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-gray-900">
            Question {questionNumber}
          </h2>
          <p className="text-sm text-gray-500">
            {questionNumber} of {totalQuestions}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
} 