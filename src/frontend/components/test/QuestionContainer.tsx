import React from 'react';
import { MultipleChoiceQuestion } from './MultipleChoiceQuestion';
import { TextResponseQuestion } from './TextResponseQuestion';
import { ForcedChoiceQuestion } from './ForcedChoiceQuestion';
import { LikertScaleQuestion } from './LikertScaleQuestion';

export type QuestionType = 'MULTIPLE_CHOICE' | 'TEXT_RESPONSE' | 'FORCED_CHOICE' | 'LIKERT_SCALE';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  description?: string;
}

export interface MultipleChoiceQuestionType extends BaseQuestion {
  type: 'MULTIPLE_CHOICE';
  options: string[];
  correctAnswer?: string;
}

export interface TextResponseQuestionType extends BaseQuestion {
  type: 'TEXT_RESPONSE';
  maxLength?: number;
}

export interface ForcedChoiceQuestionType extends BaseQuestion {
  type: 'FORCED_CHOICE';
  options: [string, string];
}

export interface LikertScaleQuestionType extends BaseQuestion {
  type: 'LIKERT_SCALE';
  scale: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

export type Question = 
  | MultipleChoiceQuestionType 
  | TextResponseQuestionType 
  | ForcedChoiceQuestionType 
  | LikertScaleQuestionType;

export interface QuestionContainerProps {
  sessionId: string;
  testId: string;
  currentSection: string;
  onAnswerSubmit: (questionId: string, answer: any) => Promise<void>;
}

export function QuestionContainer({
  sessionId,
  testId,
  currentSection,
  onAnswerSubmit,
}: QuestionContainerProps) {
  // TODO: Fetch questions for the current section
  const questions: Question[] = [];

  return (
    <div className="space-y-8">
      {questions.map((question, index) => {
        switch (question.type) {
          case 'MULTIPLE_CHOICE':
            return (
              <MultipleChoiceQuestion
                key={question.id}
                questionNumber={index + 1}
                totalQuestions={questions.length}
                question={question.text}
                options={question.options.map((text, i) => ({ id: `option-${i}`, text }))}
                onSelect={(optionId) => onAnswerSubmit(question.id, optionId)}
              />
            );
          case 'TEXT_RESPONSE':
            return (
              <TextResponseQuestion
                key={question.id}
                questionNumber={index + 1}
                totalQuestions={questions.length}
                question={question.text}
                maxLength={question.maxLength}
                onChange={(value) => onAnswerSubmit(question.id, value)}
              />
            );
          case 'FORCED_CHOICE':
            return (
              <ForcedChoiceQuestion
                key={question.id}
                questionNumber={index + 1}
                totalQuestions={questions.length}
                question={question.text}
                options={question.options}
                onSelect={(option) => onAnswerSubmit(question.id, option)}
              />
            );
          case 'LIKERT_SCALE':
            return (
              <LikertScaleQuestion
                key={question.id}
                questionNumber={index + 1}
                totalQuestions={questions.length}
                question={question.text}
                scale={question.scale}
                onSelect={(value) => onAnswerSubmit(question.id, value)}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
} 