import React, { useEffect } from 'react';
import { Button, Icon } from '@/components/ui';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  
  // Force completion after a timeout if we're submitting the final question
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (isLastQuestion && isSubmitting) {
      console.log("[EMERGENCY] Submit button is activated, setting up emergency timer");
      
      timeoutId = setTimeout(() => {
        console.log("[EMERGENCY] Emergency timer triggered - checking if we're still submitting");
        // Instead of forcing navigation, log more detailed diagnostic info
      }, 10000); // 10 second timeout
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLastQuestion, isSubmitting]);
  
  // Custom handler to add a safety net for the submit button
  const handleClick = () => {
    if (isLastQuestion) {
      console.log("[EMERGENCY] Submit button clicked, calling onNext");
      onNext();
    } else {
      // For regular next button, just call the original handler
      onNext();
    }
  };

  return (
    <div className="flex justify-between items-center animate-fade-in">
      <div>
        {!isFirstQuestion && onPrevious && (
          <Button
            variant="ghost"
            onClick={onPrevious}
            icon={<Icon name="arrow-left" size="small" />}
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
          onClick={handleClick}
          isLoading={isSubmitting}
          disabled={!isValid || isSubmitting}
          icon={isLastQuestion ? <Icon name="check" size="small" /> : <Icon name="arrow-right" size="small" />}
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