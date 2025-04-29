import React from 'react';
import { Block, UserAnswer } from '@/types/assessment';
import { QuestionRenderer } from './QuestionRenderer';
import { ScenarioQuestion } from './questions/ScenarioQuestion';
import { SingleQuestionView } from './SingleQuestionView';
import { Card } from '@/components/ui';

interface BlockRendererProps {
  block: Block;
  answers: Record<number, UserAnswer>;
  attemptId: number;
  userId: string;
  onAnswer: (questionId: number, answer: Partial<UserAnswer>) => void;
  onVideoUpload?: (questionId: number, path: string | null) => void;
  onBlockComplete: () => void;
  onQuestionChange?: (index: number) => void;
}

export function BlockRenderer({ 
  block, 
  answers, 
  attemptId, 
  userId,
  onAnswer, 
  onVideoUpload,
  onBlockComplete,
  onQuestionChange
}: BlockRendererProps) {
  // If there are no questions in this block
  if (!block.questions || block.questions.length === 0) {
    return (
      <Card colorAccent="blue" className="animate-slide-in-up">
        <div className="flex items-center gap-2 text-amber-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>No questions found in this block.</span>
        </div>
      </Card>
    );
  }

  // At this point, we know block.questions exists and is non-empty
  const questions = block.questions;

  // We'll use the single question view for most block types
  const useOneQuestionPerPage = [
    'question_group',
    'likert_group',
    undefined,
    ''
  ].includes(block.block_type);

  if (useOneQuestionPerPage) {
    return (
      <SingleQuestionView
        questions={questions}
        answers={answers}
        onAnswer={onAnswer}
        onVideoUpload={onVideoUpload}
        onComplete={onBlockComplete}
        blockTitle={block.title}
        blockDescription={block.description}
        userId={userId}
        attemptId={attemptId}
        onQuestionChange={onQuestionChange}
      />
    );
  }

  // Handle specialized block types that should remain as they are
  switch (block.block_type) {
    case 'scenario':
    case 'email_scenario':
    case 'video_scenario':
      // Get the first scenario
      const scenario = block.scenarios?.[0];
      if (!scenario) {
        return (
          <Card colorAccent="blue" className="animate-slide-in-up">
            <div className="flex items-center gap-2 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error: Scenario data not found</span>
            </div>
          </Card>
        );
      }
      
      // Find the corresponding question (we already verified questions exist)
      const relatedQuestion = questions[0];
      
      return (
        <Card colorAccent="blue" className="animate-slide-in-up">
          <ScenarioQuestion
            block={block}
            scenario={scenario}
            answer={answers[relatedQuestion.id]}
            onAnswer={(answer) => onAnswer(relatedQuestion.id, answer)}
          />
        </Card>
      );
      
    case 'scenario_group':
      // Multiple scenarios with related questions
      if (!block.scenarios || block.scenarios.length === 0) {
        return (
          <Card colorAccent="blue" className="animate-slide-in-up">
            <div className="flex items-center gap-2 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Error: Scenario data not found</span>
            </div>
          </Card>
        );
      }
      
      // Make sure we have enough questions for the scenarios
      if (questions.length < block.scenarios.length) {
        console.warn(`Block ${block.id} has ${block.scenarios.length} scenarios but only ${questions.length} questions`);
      }
      
      // Sort both scenarios and questions by sequence_order
      const sortedScenarios = [...block.scenarios].sort((a, b) => a.sequence_order - b.sequence_order);
      const sortedMCQuestions = [...questions]
        .filter(q => q.question_type === 'multiple-choice')
        .sort((a, b) => a.sequence_order - b.sequence_order);
      
      return (
        <Card 
          colorAccent="blue" 
          title={block.title}
          subtitle={block.description}
          className="animate-slide-in-up"
        >
          <div className="space-y-12">
            {sortedScenarios.map((scenario, index) => {
              // Try to match questions by sequence_order first, then fall back to array index
              let relatedQuestion;
              
              // First try to find a question with matching sequence_order
              relatedQuestion = sortedMCQuestions.find(q => q.sequence_order === scenario.sequence_order);
              
              // If not found, try to use the question at the same index
              if (!relatedQuestion && index < sortedMCQuestions.length) {
                relatedQuestion = sortedMCQuestions[index];
              }
              
              // If still not found, use the first multiple-choice question as fallback
              if (!relatedQuestion && sortedMCQuestions.length > 0) {
                relatedQuestion = sortedMCQuestions[0];
                console.warn(`Using fallback question for scenario ${scenario.id}`);
              }
              
              if (!relatedQuestion) {
                console.error(`No suitable question found for scenario ${scenario.id}`);
                return (
                  <div key={scenario.id} className="flex items-center gap-2 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Error: No question found for this scenario</span>
                  </div>
                );
              }
              
              return (
                <ScenarioQuestion
                  key={scenario.id}
                  block={block}
                  scenario={scenario}
                  answer={answers[relatedQuestion.id]}
                  onAnswer={(answer) => onAnswer(relatedQuestion.id, answer)}
                />
              );
            })}
          </div>
        </Card>
      );
    
    default:
      // Default to single question view for any unhandled block types
      return (
        <SingleQuestionView
          questions={questions}
          answers={answers}
          onAnswer={onAnswer}
          onVideoUpload={onVideoUpload}
          onComplete={onBlockComplete}
          blockTitle={block.title}
          blockDescription={block.description}
          userId={userId}
          attemptId={attemptId}
          onQuestionChange={onQuestionChange}
        />
      );
  }
} 