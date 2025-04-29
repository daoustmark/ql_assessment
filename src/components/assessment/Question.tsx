import React from 'react';
import { Card } from '../ui/Card';

interface QuestionProps {
  id: number;
  text: string;
  type: string;
  isRequired?: boolean;
  options?: Array<{ id: number, option_text: string, sequence_order: number }>;
  value: any;
  onChange: (value: any) => void;
}

export function Question({
  id,
  text,
  type,
  isRequired = false,
  options = [],
  value,
  onChange
}: QuestionProps) {
  const renderQuestionByType = () => {
    switch (type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3 mt-4">
            {options
              .sort((a, b) => a.sequence_order - b.sequence_order)
              .map((option) => (
                <div key={option.id} className="form-control">
                  <label className="flex items-center cursor-pointer gap-3 p-3 rounded-md hover:bg-nomad-blue-25 transition-colors">
                    <input
                      type="radio"
                      name={`question-${id}`}
                      className="radio radio-sm radio-secondary"
                      checked={value?.selected_option_id === option.id}
                      onChange={() => onChange({ selected_option_id: option.id })}
                    />
                    <span className="text-bespoke-navy">{option.option_text}</span>
                  </label>
                </div>
              ))}
          </div>
        );
      
      case 'textarea':
        return (
          <div className="mt-4">
            <textarea
              className="textarea textarea-bordered w-full bg-white focus:border-nomad-blue focus:ring-1 focus:ring-nomad-blue min-h-32"
              placeholder="Type your answer here"
              value={value?.answer_text || ''}
              onChange={(e) => onChange({ answer_text: e.target.value })}
            />
          </div>
        );
      
      // Additional question types can be added here
      
      default:
        return <p className="text-error mt-4">Unsupported question type: {type}</p>;
    }
  };

  return (
    <Card className="mb-6">
      <div className="mb-2">
        <p className="font-medium text-bespoke-navy text-lg">
          {text}
          {isRequired && <span className="text-error ml-1">*</span>}
        </p>
      </div>
      
      {renderQuestionByType()}
    </Card>
  );
} 