'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card, Button, SkeletonLoader } from '@/components/ui';
import { ProgressIndicator } from './ProgressIndicator';
import { Question } from './Question';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { BlockRenderer } from './BlockRenderer';
import { BlockTransition } from './BlockTransition';
import { Part } from '@/types/assessment';

interface AssessmentPartProps {
  part: Part;
  totalParts: number;
  attemptId: number;
  onComplete: () => void;
  onBlockChange?: (blockIndex: number) => void;
}

export function AssessmentPart({ part, totalParts, attemptId, onComplete, onBlockChange }: AssessmentPartProps) {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [completedBlockIndex, setCompletedBlockIndex] = useState<number | null>(null);
  const [showBlockTransition, setShowBlockTransition] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [userId, setUserId] = useState<string | null>(null);
  
  // Convert attemptId to a number if it's a string
  const numericAttemptId = typeof attemptId === 'string' ? parseInt(attemptId, 10) : attemptId;
  
  // Fetch blocks and answers
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      
      try {
        const supabase = createClient();

        // Get the current user
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          setUserId(userData.user.id);
        }
        
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
            ),
            scenarios(
              id,
              scenario_text,
              sequence_order,
              scenario_options(id, option_text, sequence_order)
            )
          `)
          .eq('part_id', part.id)
          .order('sequence_order', { ascending: true });

        if (blocksError) throw blocksError;
        
        // Fetch existing answers for this attempt
        const { data: answersData, error: answersError } = await supabase
          .from('user_answers')
          .select('*')
          .eq('attempt_id', numericAttemptId);
        
        if (answersError) throw answersError;
        
        // Transform answers into a more usable format
        const answersMap: Record<string, any> = {};
        answersData?.forEach(answer => {
          answersMap[answer.question_id] = {
            id: answer.id,
            text_answer: answer.text_answer,
            mcq_option_id: answer.mcq_option_id,
            likert_rating: answer.likert_rating,
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

    fetchData();
  }, [part.id, numericAttemptId]);

  // Handle answer submission
  const handleAnswer = async (questionId: number, answer: any) => {
    try {
      const supabase = createClient();
      
      // Check if there's an existing answer
      const existingAnswer = answers[questionId];
      
      if (existingAnswer) {
        // Update existing answer
        const { error } = await supabase
          .from('user_answers')
          .update(answer)
          .eq('id', existingAnswer.id);
          
        if (error) throw error;
      } else {
        // Create new answer
        const { error } = await supabase
          .from('user_answers')
          .insert({
            attempt_id: numericAttemptId,
            question_id: questionId,
            ...answer
          });
          
        if (error) throw error;
      }
      
      // Update local state
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          ...answer
        }
      }));
    } catch (err: any) {
      console.error('Error saving answer:', err);
    }
  };
  
  const handleVideoUpload = async (questionId: number, path: string | null) => {
    try {
      if (!path) return;
      
      const supabase = createClient();
      
      // Include video path in the answer
      await handleAnswer(questionId, { video_response_path: path });
    } catch (err: any) {
      console.error('Error saving video path:', err);
    }
  };
  
  const nextBlock = () => {
    if (currentBlockIndex < blocks.length - 1) {
      // Move to next block
      setCompletedBlockIndex(currentBlockIndex);
      setShowBlockTransition(true);
    } else {
      // This is the last block, complete the part
      onComplete();
    }
  };
  
  const handleContinueToNextBlock = () => {
    setShowBlockTransition(false);
    setIsTransitioning(true);
    
    setTimeout(() => {
      const nextBlockIndex = currentBlockIndex + 1;
      setCurrentBlockIndex(nextBlockIndex);
      
      // Call the onBlockChange callback to update the parent component
      if (onBlockChange) {
        onBlockChange(nextBlockIndex);
      }
      
      // Scroll to top
      window.scrollTo(0, 0);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }, 300);
  };
  
  const handleQuestionChange = (index: number) => {
    if (onBlockChange) {
      onBlockChange(index);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Card>
        <div className="flex flex-col gap-4 w-full">
          <SkeletonLoader className="h-8 w-3/4" />
          <SkeletonLoader className="h-32 w-full" />
          <SkeletonLoader className="h-8 w-1/2" />
        </div>
      </Card>
    );
  }

  // Show error state
  if (error) {
    return (
      <Card>
        <div className="flex items-start gap-2 text-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Error: {error}</span>
        </div>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Try Again
        </Button>
      </Card>
    );
  }

  // Show empty state
  if (blocks.length === 0) {
    return (
      <Card className="animate-slide-in-up">
        <h2 className="text-xl font-medium text-bespoke-navy mb-4">No content found</h2>
        <p className="text-bespoke-navy-75 mb-8">There are no questions in this section.</p>
        <div className="flex justify-end">
          <Button 
            variant="primary"
            onClick={onComplete}
          >
            Continue
          </Button>
        </div>
      </Card>
    );
  }

  const currentBlock = blocks[currentBlockIndex];

  // If showing the block transition screen
  if (showBlockTransition && completedBlockIndex !== null) {
    const prevBlock = blocks[completedBlockIndex];
    const nextBlock = blocks[currentBlockIndex + 1];
    
    return (
      <BlockTransition
        prevBlockTitle={prevBlock.title}
        nextBlockTitle={nextBlock.title}
        partTitle={part.title}
        partProgress={{ current: currentBlockIndex + 1, total: blocks.length }}
        onContinue={handleContinueToNextBlock}
      />
    );
  }

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
      <BlockRenderer
        block={currentBlock}
        answers={answers}
        attemptId={numericAttemptId}
        userId={userId}
        onAnswer={handleAnswer}
        onVideoUpload={handleVideoUpload}
        onBlockComplete={nextBlock}
        onQuestionChange={handleQuestionChange}
      />
    </PageContainer>
  );
} 