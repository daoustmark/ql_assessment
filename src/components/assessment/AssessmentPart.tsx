'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressIndicator } from './ProgressIndicator';
import { Question } from './Question';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AssessmentPartProps {
  part: {
    id: number;
    title: string;
    description: string;
    sequence_order: number;
  };
  totalParts: number;
  attemptId: string;
  onComplete: () => void;
}

export function AssessmentPart({ part, totalParts, attemptId, onComplete }: AssessmentPartProps) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);

  React.useEffect(() => {
    async function fetchBlocks() {
      setLoading(true);
      
      try {
        const supabase = createClient();
        
        // Fetch blocks for this part
        const { data: blocksData, error: blocksError } = await supabase
          .from('blocks')
          .select(`
            id, 
            title, 
            description, 
            block_type, 
            sequence_order,
            questions(
              id, 
              question_text, 
              question_type, 
              sequence_order, 
              is_required,
              mcq_options(id, option_text, sequence_order)
            )
          `)
          .eq('part_id', part.id)
          .order('sequence_order', { ascending: true });

        if (blocksError) throw blocksError;
        
        // Fetch existing answers for this attempt
        const { data: answersData, error: answersError } = await supabase
          .from('user_answers')
          .select('*')
          .eq('attempt_id', attemptId);
        
        if (answersError) throw answersError;
        
        // Transform answers into a more usable format
        const answersMap: Record<string, any> = {};
        answersData?.forEach(answer => {
          answersMap[answer.question_id] = {
            id: answer.id,
            answer_text: answer.answer_text,
            selected_option_id: answer.selected_option_id,
            likert_value: answer.likert_value,
            video_response_path: answer.video_response_path
          };
        });

        setBlocks(blocksData || []);
        setAnswers(answersMap);
      } catch (err: any) {
        console.error('Error fetching blocks:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBlocks();
  }, [part.id, attemptId]);

  const handleAnswer = (questionId: number, answerData: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...answerData
      }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      const supabase = createClient();
      
      // Insert or update answers
      for (const [questionId, answerData] of Object.entries(answers)) {
        if (answerData.id) {
          // Update existing answer
          await supabase
            .from('user_answers')
            .update({
              answer_text: answerData.answer_text,
              selected_option_id: answerData.selected_option_id,
              likert_value: answerData.likert_value,
              video_response_path: answerData.video_response_path,
              updated_at: new Date().toISOString()
            })
            .eq('id', answerData.id);
        } else {
          // Insert new answer
          await supabase
            .from('user_answers')
            .insert({
              attempt_id: attemptId,
              question_id: parseInt(questionId),
              answer_text: answerData.answer_text,
              selected_option_id: answerData.selected_option_id,
              likert_value: answerData.likert_value,
              video_response_path: answerData.video_response_path
            });
        }
      }
      
      // Call onComplete to move to the next part
      onComplete();
    } catch (err: any) {
      console.error('Error submitting answers:', err);
      setError('Failed to save your answers. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextBlock = () => {
    if (currentBlockIndex < blocks.length - 1) {
      setCurrentBlockIndex(currentBlockIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevBlock = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingSpinner message="Loading assessment..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="p-6 text-center bg-error bg-opacity-10 border border-error text-error rounded-lg">
          {error}
        </div>
      </PageContainer>
    );
  }

  // If no blocks, handle empty state
  if (blocks.length === 0) {
    return (
      <PageContainer title={part.title} subtitle={part.description}>
        <Card>
          <p className="text-center text-bespoke-navy-75">No questions found for this section.</p>
        </Card>
        <div className="mt-8 flex justify-end">
          <Button variant="secondary" onClick={onComplete}>
            Continue to Next Section
          </Button>
        </div>
      </PageContainer>
    );
  }

  const currentBlock = blocks[currentBlockIndex];
  const sortedQuestions = currentBlock?.questions?.sort((a: any, b: any) => a.sequence_order - b.sequence_order) || [];

  return (
    <PageContainer className="fade-in">
      {/* Part Progress */}
      <div className="mb-8">
        <ProgressIndicator 
          currentStep={part.sequence_order} 
          totalSteps={totalParts}
          labels={Array.from({ length: totalParts }, (_, i) => `Part ${i + 1}`)}
        />
      </div>

      {/* Part Title */}
      <div className="bg-bespoke-navy-25 border-l-4 border-bespoke-navy p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-bold text-bespoke-navy mb-3">{part.title}</h2>
        <p className="text-bespoke-navy-75">{part.description}</p>
      </div>

      {/* Block Progress */}
      {blocks.length > 1 && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-bespoke-navy-75">
              Section {currentBlockIndex + 1} of {blocks.length}
            </span>
            <span className="text-sm font-medium text-bespoke-navy-75">
              {Math.round(((currentBlockIndex + 1) / blocks.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-constant-green h-full" 
              style={{ width: `${((currentBlockIndex + 1) / blocks.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Current Block */}
      <Card
        title={currentBlock.title}
        description={currentBlock.description}
        variant="secondary"
        className="mb-8"
      >
        <div className="space-y-6">
          {sortedQuestions.map((question: any) => (
            <Question
              key={question.id}
              id={question.id}
              text={question.question_text}
              type={question.question_type}
              isRequired={question.is_required}
              options={question.mcq_options}
              value={answers[question.id] || {}}
              onChange={(value) => handleAnswer(question.id, value)}
            />
          ))}
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4">
        <Button 
          variant="outline"
          onClick={currentBlockIndex > 0 ? prevBlock : () => window.history.back()}
          disabled={submitting}
        >
          {currentBlockIndex > 0 ? 'Previous' : 'Back'}
        </Button>
        
        {currentBlockIndex < blocks.length - 1 ? (
          <Button 
            variant="secondary"
            onClick={nextBlock}
          >
            Continue
          </Button>
        ) : (
          <Button 
            variant="secondary"
            onClick={handleSubmit}
            isLoading={submitting}
          >
            {submitting ? 'Saving...' : 'Complete Section'}
          </Button>
        )}
      </div>
    </PageContainer>
  );
} 