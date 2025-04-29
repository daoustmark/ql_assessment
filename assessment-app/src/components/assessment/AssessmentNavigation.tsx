import React, { useState } from 'react';
import { Part, Block, AssessmentAttempt, UserAnswer } from '@/types/assessment';

interface AssessmentNavigationProps {
  currentPart: Part | null;
  currentBlock: Block | null;
  parts: Part[];
  attempt: AssessmentAttempt | null;
  answers: Record<number, UserAnswer>;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  onComplete: () => Promise<boolean>;
  isLastBlock: boolean;
}

export function AssessmentNavigation({
  currentPart,
  currentBlock,
  parts,
  attempt,
  answers,
  onNavigateNext,
  onNavigatePrevious,
  onComplete,
  isLastBlock
}: AssessmentNavigationProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the current block has unanswered required questions
  const hasUnansweredRequired = () => {
    if (!currentBlock || !currentBlock.questions) return false;
    
    return currentBlock.questions.some(question => {
      if (!question.is_required) return false;
      
      const answer = answers[question.id];
      if (!answer) return true;
      
      // Check for appropriate answer content based on question type
      switch (question.question_type) {
        case 'multiple-choice':
          return answer.selected_option_id === undefined;
          
        case 'textarea':
        case 'written':
        case 'email':
          return !answer.answer_text || answer.answer_text.trim() === '';
          
        case 'likert':
          return answer.likert_value === undefined;
          
        case 'video':
          return !answer.video_response_path;
          
        default:
          return false;
      }
    });
  };
  
  const handleComplete = async () => {
    if (hasUnansweredRequired()) {
      // Show error message or scroll to first unanswered required question
      return;
    }
    
    setIsSubmitting(true);
    const success = await onComplete();
    setIsSubmitting(false);
    
    if (success) {
      // Potentially redirect to a completion page
    }
  };
  
  const isFirstBlock = () => {
    if (!parts.length || !currentPart || !currentBlock) return true;
    
    const firstPart = parts[0];
    if (currentPart.id !== firstPart.id) return false;
    
    const firstBlock = firstPart.blocks?.[0];
    return currentBlock.id === firstBlock?.id;
  };
  
  const progressPercentage = () => {
    if (!parts.length || !currentPart || !currentBlock) return 0;
    
    let totalBlocks = 0;
    let completedBlocks = 0;
    let foundCurrent = false;
    
    for (const part of parts) {
      if (!part.blocks) continue;
      
      totalBlocks += part.blocks.length;
      
      for (const block of part.blocks) {
        if (foundCurrent) continue;
        
        completedBlocks++;
        
        if (part.id === currentPart.id && block.id === currentBlock.id) {
          foundCurrent = true;
          completedBlocks--; // Don't count current block as completed
        }
      }
    }
    
    return Math.floor((completedBlocks / totalBlocks) * 100);
  };
  
  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm">
          {currentPart?.title} - {currentBlock?.title}
        </span>
        <span className="text-sm font-medium">
          Progress: {progressPercentage()}%
        </span>
      </div>
      
      <div className="w-full bg-base-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-primary h-2.5 rounded-full" 
          style={{ width: `${progressPercentage()}%` }}
        />
      </div>
      
      <div className="flex justify-between">
        <button
          className="btn btn-outline"
          onClick={onNavigatePrevious}
          disabled={isFirstBlock() || isSubmitting}
        >
          Previous
        </button>
        
        {isLastBlock ? (
          <button
            className="btn btn-primary"
            onClick={handleComplete}
            disabled={isSubmitting || hasUnansweredRequired()}
          >
            {isSubmitting ? 'Submitting...' : 'Complete Assessment'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onNavigateNext}
            disabled={isSubmitting || hasUnansweredRequired()}
          >
            Next
          </button>
        )}
      </div>
      
      {hasUnansweredRequired() && (
        <div className="text-error text-sm mt-4 text-center">
          Please answer all required questions before proceeding
        </div>
      )}
    </div>
  );
} 