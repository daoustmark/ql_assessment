import React from 'react';
import { RadioGroup, RadioGroupItem } from '../ui/RadioGroup';
import { QuestionContainer } from './QuestionContainer';
import { cn } from '../../utils/cn';

interface LikertScaleQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  scale: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
  selectedValue?: number;
  onSelect: (value: number) => void;
  error?: string;
  className?: string;
}

export function LikertScaleQuestion({
  questionNumber,
  totalQuestions,
  question,
  scale,
  selectedValue,
  onSelect,
  error,
  className,
}: LikertScaleQuestionProps) {
  const { min, max, minLabel = 'Strongly Disagree', maxLabel = 'Strongly Agree' } = scale;
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <QuestionContainer
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      className={className}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-lg text-gray-900">{question}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="space-y-4">
          <RadioGroup
            value={selectedValue?.toString()}
            onValueChange={(value) => onSelect(parseInt(value, 10))}
            className="flex justify-between"
          >
            {values.map((value) => (
              <div key={value} className="flex flex-col items-center">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={value.toString()} id={`scale-${value}`} />
                  <label
                    htmlFor={`scale-${value}`}
                    className="text-base text-gray-700 cursor-pointer"
                  >
                    {value}
                  </label>
                </div>
                {(value === min || value === max) && (
                  <span className="text-sm text-gray-500 mt-1">
                    {value === min ? minLabel : maxLabel}
                  </span>
                )}
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </QuestionContainer>
  );
} 