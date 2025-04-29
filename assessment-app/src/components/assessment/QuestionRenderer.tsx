import React from 'react';
import { Question, Block, UserAnswer, Scenario } from '@/types/assessment';
import { MCQQuestion } from './questions/MCQQuestion';
import { TextQuestion } from './questions/TextQuestion';
import { LikertQuestion } from './questions/LikertQuestion';
import { ScenarioQuestion } from './questions/ScenarioQuestion';
import { VideoRecorder } from './VideoRecorder';

interface QuestionRendererProps {
  question: Question;
  block: Block;
  scenario?: Scenario;
  answer?: UserAnswer;
  attemptId: number;
  onAnswer: (answer: Partial<UserAnswer>) => void;
  onNext?: () => void;
}

export function QuestionRenderer({ question, block, scenario, answer, attemptId, onAnswer, onNext }: QuestionRendererProps) {
  switch (question.question_type) {
    case 'multiple-choice':
      return (
        <MCQQuestion
          question={question}
          answer={answer}
          onAnswer={onAnswer}
          onNext={onNext}
        />
      );
      
    case 'textarea':
    case 'written':
    case 'email':
      return (
        <TextQuestion
          question={question}
          answer={answer}
          onAnswer={onAnswer}
        />
      );
      
    case 'likert':
      return (
        <LikertQuestion
          question={question}
          answer={answer}
          onAnswer={onAnswer}
        />
      );
      
    case 'video':
      return (
        <VideoRecorder
          question={question}
          attemptId={attemptId}
          answer={answer}
          onAnswer={onAnswer}
        />
      );
      
    default:
      return <div className="text-error">Unknown question type: {question.question_type}</div>;
  }
} 