import React, { useState, useEffect } from 'react';
import { QuestionNavigation } from './QuestionNavigation';
import { Card, ProgressBar } from '@/components/ui';
import { Question, UserAnswer } from '@/types/assessment';

// Import all question type components
import { MCQQuestion } from './questions/MCQQuestion';
import { TextQuestion } from './questions/TextQuestion';
import { LikertQuestion } from './questions/LikertQuestion';
import { ScenarioQuestion } from './questions/ScenarioQuestion';
import { VideoRecorder } from './VideoRecorder';

interface SingleQuestionViewProps {
  questions: Question[];
  answers: Record<string, UserAnswer>;
  onAnswer: (questionId: number, answer: Partial<UserAnswer>) => void;
  onVideoUpload?: (questionId: number, path: string | null) => void;
  onComplete: () => void;
  blockTitle?: string;
  blockDescription?: string;
  userId: string;
  attemptId: number;
  onQuestionChange?: (index: number) => void;
}

export function SingleQuestionView({
  questions,
  answers,
  onAnswer,
  onVideoUpload,
  onComplete,
  blockTitle,
  blockDescription,
  userId,
  attemptId,
  onQuestionChange
}: SingleQuestionViewProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const sortedQuestions = [...questions].sort((a, b) => a.sequence_order - b.sequence_order);
  const currentQuestion = sortedQuestions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  useEffect(() => {
    // Check if the current question's answer is valid
    if (currentQuestion && currentQuestion.is_required) {
      const answer = answers[currentQuestion.id];
      
      if (!answer) {
        setIsValid(false);
      } else {
        switch (currentQuestion.question_type) {
          case 'multiple-choice':
            setIsValid(!!answer.selected_option_id);
            break;
          case 'textarea':
          case 'written':
            setIsValid(!!answer.text_answer && answer.text_answer.trim() !== '');
            break;
          case 'video':
            setIsValid(!!answer.video_response_path);
            break;
          case 'likert':
            setIsValid(!!answer.likert_rating);
            break;
          default:
            setIsValid(true);
        }
      }
    } else {
      setIsValid(true);
    }
  }, [currentQuestion, answers]);

  // Notify parent when question changes
  useEffect(() => {
    if (onQuestionChange) {
      onQuestionChange(currentQuestionIndex);
    }
  }, [currentQuestionIndex, onQuestionChange]);

  const handleNext = () => {
    if (currentQuestionIndex < sortedQuestions.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      // This is the final question - save only the current answer with correct fields
      if (currentQuestion) {
        let answerPayload: Partial<UserAnswer> = {};
        switch (currentQuestion.question_type) {
          case 'multiple-choice':
            answerPayload = { selected_option_id: currentAnswer?.selected_option_id };
            break;
          case 'textarea':
          case 'written':
            answerPayload = { text_answer: currentAnswer?.text_answer };
            break;
          case 'likert':
            answerPayload = { likert_rating: currentAnswer?.likert_rating };
            break;
          case 'video':
            answerPayload = { video_response_path: currentAnswer?.video_response_path };
            break;
          default:
            // fallback: send only text_answer if present
            if (currentAnswer?.text_answer) answerPayload = { text_answer: currentAnswer.text_answer };
        }
        onAnswer(currentQuestion.id, answerPayload);
      }
      setIsSubmitting(true);
      // Add a safety timeout in case the submission takes too long
      const safetyTimeout = setTimeout(() => {
        setIsSubmitting(false);
      }, 30000);
      const handleCompletion = async () => {
        try {
          await Promise.resolve(onComplete());
          clearTimeout(safetyTimeout);
          setTimeout(() => {
            setIsSubmitting(false);
          }, 500);
          return "completed";
        } catch (error) {
          clearTimeout(safetyTimeout);
          setIsSubmitting(false);
          return "error";
        }
      };
      setTimeout(() => {}, 5000);
      handleCompletion();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleQuestionAnswer = (answer: Partial<UserAnswer>) => {
    if (currentQuestion) {
      onAnswer(currentQuestion.id, answer);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  const renderQuestionComponent = () => {
    switch (currentQuestion.question_type) {
      case 'multiple-choice':
        return (
          <MCQQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleQuestionAnswer}
          />
        );
      case 'textarea':
      case 'written':
        return (
          <TextQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleQuestionAnswer}
          />
        );
      case 'likert':
        return (
          <LikertQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleQuestionAnswer}
          />
        );
      case 'video':
        return (
          <VideoRecorder
            userId={userId}
            attemptId={attemptId}
            questionId={currentQuestion.id}
            onUploadComplete={(path) => onVideoUpload && onVideoUpload(currentQuestion.id, path)}
          />
        );
      default:
        return (
          <TextQuestion
            question={currentQuestion}
            answer={currentAnswer}
            onAnswer={handleQuestionAnswer}
          />
        );
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Block Title */}
      {blockTitle && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-2">
          <h2 className="text-xl font-semibold">
            {blockTitle.replace(/^Block \d+: /, '')}
          </h2>
        </div>
      )}
      
      <Card 
        className={`transition-opacity duration-slow ${isTransitioning ? 'opacity-0' : 'opacity-100'} animate-slide-in-up bg-white rounded-lg shadow-sm border border-gray-200`}
        padding="medium"
        elevation="floating"
      >
        {/* Question header with question text */}
        <div className="border-b border-subtle pb-6 mb-7">
          <h3 className="text-sm font-medium text-text-light mb-3">
            Question {currentQuestionIndex + 1} of {sortedQuestions.length}
          </h3>
          <div className="text-question font-semibold text-text-heading leading-question tracking-heading">
            {currentQuestion.question_text}
          </div>
        </div>
        
        {/* Answer options */}
        <div className="mt-8">
          {renderQuestionComponent()}
        </div>

        {/* Navigation */}
        <div className="pt-8 mt-10 border-t border-subtle">
          <QuestionNavigation
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirstQuestion={currentQuestionIndex === 0}
            isLastQuestion={currentQuestionIndex === sortedQuestions.length - 1}
            isSubmitting={isSubmitting}
            isValid={isValid}
          />
        </div>
      </Card>
    </div>
  );
} 