import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { RadioButton } from '../ui/RadioButton';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

interface Option {
  id: string;
  text: string;
}

interface MultipleChoiceProps {
  id: string;
  question: string;
  options: Option[];
  onSubmit: (selectedOptionId: string) => void;
  required?: boolean;
  className?: string;
}

const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  id,
  question,
  options,
  onSubmit,
  required = true,
  className = '',
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOptionId(e.target.value);
    setHasError(false);
  };

  const handleSubmit = () => {
    if (required && !selectedOptionId) {
      setHasError(true);
      return;
    }

    if (selectedOptionId) {
      setIsSubmitting(true);
      // Add transition effect before submitting
      setTimeout(() => {
        onSubmit(selectedOptionId);
        setIsSubmitting(false);
      }, 300);
    }
  };

  return (
    <Card 
      className={`max-w-3xl mx-auto transition-all duration-emphasis ease-emphasis ${isSubmitting ? 'opacity-0 transform translate-x-4' : 'opacity-100'} ${className}`}
      variant="default"
      padding="large"
      withTexture={true}
      elevation="base"
    >
      <div className="space-y-8">
        <h3 className="text-question font-semibold text-heading leading-question tracking-heading">
          {question}
        </h3>
        
        <div className="pt-4">
          <div className="space-y-5">
            {options.map((option) => (
              <div 
                key={option.id} 
                className="transition-all duration-base hover:transform pl-4"
              >
                <RadioButton
                  id={`${id}-option-${option.id}`}
                  name={`question-${id}`}
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={handleOptionChange}
                  label={option.text}
                />
              </div>
            ))}
          </div>
          
          {hasError && (
            <div className="mt-4 text-sm text-error animate-fade-in">
              Please select an option before continuing.
            </div>
          )}
        </div>
        
        <div className="pt-4 flex justify-end">
          <Tooltip 
            content="Please select an option to proceed" 
            position="top"
            disabled={!required || !!selectedOptionId}
          >
            <div>
              <Button
                variant="next"
                onClick={handleSubmit}
                disabled={required && !selectedOptionId}
                className={selectedOptionId ? 'animate-pulse' : ''}
              >
                Next
              </Button>
            </div>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};

export default MultipleChoice; 