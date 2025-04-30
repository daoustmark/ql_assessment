'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VideoRecorder } from './VideoRecorder';
import { BlockRenderer } from './BlockRenderer';
import { BlockTransition } from './BlockTransition';
import { Card, ProgressBar, Button } from '@/components/ui';

interface PartType {
  id: number;
  title: string;
  description: string;
  sequence_order: number;
}

interface AssessmentPartProps {
  part: PartType;
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
  const [userId, setUserId] = useState<string>('');
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showBlockTransition, setShowBlockTransition] = useState(false);
  const [completedBlockIndex, setCompletedBlockIndex] = useState<number | null>(null);
  const numericAttemptId = parseInt(attemptId);

  React.useEffect(() => {
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
  }, [part.id, attemptId, numericAttemptId]);

  const handleAnswer = (questionId: number, answerData: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        ...answerData
      }
    }));
  };

  const handleVideoUpload = (questionId: number, path: string | null) => {
    if (path) {
      handleAnswer(questionId, { video_response_path: path });
    }
  };

  const handleSubmit = async () => {
    console.log("[DEBUG-PART] Starting handleSubmit");
    setSubmitting(true);
    
    try {
      const supabase = createClient();
      console.log("[DEBUG-PART] Creating supabase client completed");
      
      // Track how many answers we're attempting to save
      const totalAnswers = Object.entries(answers).length;
      console.log(`[DEBUG-PART] Processing ${totalAnswers} answers`);
      
      let processedCount = 0;
      
      // Insert or update answers
      for (const [questionId, answerData] of Object.entries(answers)) {
        try {
          if (answerData.id) {
            // Update existing answer
            console.log(`[DEBUG-PART] Updating answer for question ${questionId}`);
            const { error: updateError } = await supabase
              .from('user_answers')
              .update({
                text_response: answerData.text_answer,
                selected_mcq_option_id: answerData.mcq_option_id,
                likert_score: answerData.likert_rating,
                video_response_path: answerData.video_response_path,
                updated_at: new Date().toISOString()
              })
              .eq('id', answerData.id);
              
            if (updateError) {
              console.error('[DEBUG-PART] Error updating answer:', updateError);
              throw new Error(`Failed to update answer: ${updateError.message}`);
            }
          } else {
            // Insert new answer
            console.log(`[DEBUG-PART] Inserting new answer for question ${questionId}`);
            const { error: insertError } = await supabase
              .from('user_answers')
              .insert({
                attempt_id: numericAttemptId,
                question_id: parseInt(questionId),
                text_response: answerData.text_answer,
                selected_mcq_option_id: answerData.mcq_option_id,
                likert_score: answerData.likert_rating,
                video_response_path: answerData.video_response_path
              });
              
            if (insertError) {
              console.error('[DEBUG-PART] Error inserting answer:', insertError);
              throw new Error(`Failed to insert answer: ${insertError.message}`);
            }
          }
          
          processedCount++;
          console.log(`[DEBUG-PART] Processed ${processedCount}/${totalAnswers} answers`);
        } catch (answerError) {
          console.error(`[DEBUG-PART] Error processing answer for question ${questionId}:`, answerError);
          // Continue with other answers instead of failing everything
        }
      }
      
      console.log(`[DEBUG-PART] Answer processing complete. Successfully processed ${processedCount}/${totalAnswers} answers`);
      
      // Call onComplete to move to the next part - with timeout protection
      console.log("[DEBUG-PART] All answers saved, now calling onComplete to move to next part");
      
      // Prevent Spinner from getting stuck by ensuring submitting state is reset
      setTimeout(() => {
        if (submitting) {
          console.log("[DEBUG-PART] Force resetting submitting state after 8 seconds");
          setSubmitting(false);
        }
      }, 8000);
      
      // Always update the submission state after a short delay
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
      
      // Call the completion callback
      try {
        console.log("[DEBUG-PART] Calling onComplete to move to next part");
        // Make sure onComplete is valid before calling it
        if (typeof onComplete === 'function') {
          await Promise.resolve(onComplete()); // Use Promise.resolve to handle both sync and async functions
          console.log("[DEBUG-PART] onComplete called successfully - should be moving to next part now");
        } else {
          console.error("[DEBUG-PART] onComplete is not a function:", typeof onComplete);
        }
      } catch (completeError) {
        console.error('[DEBUG-PART] Error during completion callback:', completeError);
        throw completeError;
      }
    } catch (err) {
      console.error('[DEBUG-PART] Error submitting answers:', err);
      setError('Failed to save your answers. Please try again.');
      setTimeout(() => setSubmitting(false), 1000);
    }
  };

  const nextBlock = () => {
    if (currentBlockIndex < blocks.length - 1) {
      // Set the completed block index to show in the transition screen
      setCompletedBlockIndex(currentBlockIndex);
      setShowBlockTransition(true);
    } else {
      handleSubmit();
    }
  };

  const handleContinueToNextBlock = () => {
    // Hide the transition screen
    setShowBlockTransition(false);
    
    // Move to the next block
    setCurrentBlockIndex(currentBlockIndex + 1);
    setCurrentQuestionIndex(0);
    window.scrollTo(0, 0);
  };

  const prevBlock = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleQuestionChange = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="loading loading-spinner loading-lg text-nomad-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="animate-slide-in-up">
        <div className="text-center text-error">
          {error}
        </div>
      </Card>
    );
  }

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
    <div className="space-y-8">
      {/* Header with progress indicators in two columns */}
      <div className="bg-white rounded-lg p-5 shadow-md border border-gray-200">
        {/* Two-column layout for progress bars */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left column: Section Progress */}
          <div>
            <ProgressBar 
              current={currentBlockIndex + 1} 
              total={blocks.length} 
              variant="blue" 
              height="h-4"
              label="Section Progress"
            />
            <p className="text-sm text-gray-600 mt-1">{part.title}</p>
          </div>
          
          {/* Right column: Question Block Progress */}
          <div>
            <ProgressBar 
              current={currentQuestionIndex + 1} 
              total={currentBlock?.questions?.length || 1} 
              variant="gradient" 
              height="h-4"
              label="Question Progress"
            />
            <p className="text-sm text-gray-600 mt-1">
              {currentBlock?.title ? `Block ${currentBlockIndex + 1}: ${currentBlock.title.replace(/^Block \d+: /, '')}` : "Current Block"}
            </p>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Part {part.sequence_order}: {part.title}
        </h1>
        <p className="text-gray-700 mt-2">
          {part.description}
        </p>
      </div>

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
    </div>
  );
} 