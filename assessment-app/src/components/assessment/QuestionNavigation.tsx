import React from 'react';
import { Button, Icon } from '@/components/ui';

interface QuestionNavigationProps {
  onNext: () => void;
  onPrevious?: () => void;
  isFirstQuestion: boolean;
  isLastQuestion: boolean;
  isSubmitting?: boolean;
  isValid?: boolean;
}

export function QuestionNavigation({ 
  onNext, 
  onPrevious, 
  isFirstQuestion,
  isLastQuestion,
  isSubmitting = false,
  isValid = true
}: QuestionNavigationProps) {
  return (
    <div className="flex justify-between items-center animate-fade-in">
      <div>
        {!isFirstQuestion && onPrevious && (
          <Button
            variant="ghost"
            onClick={onPrevious}
            icon={<Icon name="previous" size="sm" />}
            iconPosition="left"
            className="hover:bg-hover"
          >
            Previous
          </Button>
        )}
      </div>
      
      <div className="relative">
        {!isValid && (
          <div className="absolute -top-7 right-0 text-sm text-error animate-fade-in">
            Please answer this question
          </div>
        )}
        <Button
          variant={isLastQuestion ? "secondary" : "primary"}
          onClick={onNext}
          isLoading={isSubmitting}
          disabled={!isValid || isSubmitting}
          icon={isLastQuestion ? <Icon name="check" size="sm" /> : <Icon name="next" size="sm" />}
          iconPosition="right"
          className="min-w-[120px]"
          animated={true}
        >
          {isLastQuestion ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
} 