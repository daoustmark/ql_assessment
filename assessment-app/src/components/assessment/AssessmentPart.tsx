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
  onBlockChange?: (blockIndex: number, questionIndex: number, block: any) => void;
}

export function AssessmentPart({ part, totalParts, attemptId, onComplete, onBlockChange }: AssessmentPartProps) {
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
        
        // For blocks with scenario type but missing scenarios, fetch them separately
        const scenarioBlocks = blocksData?.filter(block => 
          (block.block_type === 'scenario' || block.block_type?.includes('scenario')) && 
          (!block.scenarios || block.scenarios.length === 0)
        ) || [];

        // If we have scenario blocks missing scenarios data, fetch them
        if (scenarioBlocks.length > 0) {
          console.log(`[DEBUG] Found ${scenarioBlocks.length} blocks missing scenario data, fetching...`);
          
          // Process blocks one by one to make sure each gets proper scenarios
          for (const block of scenarioBlocks) {
            const { data: scenariosData, error: scenariosError } = await supabase
              .from('scenarios')
              .select(`
                id,
                scenario_text,
                sequence_order,
                scenario_options(id, option_text, sequence_order)
              `)
              .eq('block_id', block.id)
              .order('sequence_order');
              
            if (scenariosError) {
              console.error(`Error fetching scenarios for block ${block.id}:`, scenariosError);
              continue;
            }
            
            if (scenariosData && scenariosData.length > 0) {
              // Update this block with the fetched scenarios
              block.scenarios = scenariosData;
              console.log(`[DEBUG] Added ${scenariosData.length} scenarios to block ${block.id}`);
            } else {
              console.warn(`[DEBUG] No scenarios found for block ${block.id}, type: ${block.block_type}`);
            }
          }
        }

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
      
      // Get the current block and question
      const currentBlock = blocks[currentBlockIndex];
      if (!currentBlock || !currentBlock.questions) {
        console.error("[DEBUG-PART] Current block or questions not found");
        setSubmitting(false);
        return;
      }
      
      // Get all questions in the current block
      const blockQuestions = currentBlock.questions;
      console.log(`[DEBUG-PART] Processing answers for current block only (${blockQuestions.length} questions)`);
      
      let processedCount = 0;
      
      // Only process questions from the current block
      for (const question of blockQuestions) {
        const questionId = question.id.toString();
        const answerData = answers[questionId];
        
        // Skip if no answer data exists for this question
        if (!answerData) {
          console.log(`[DEBUG-PART] No answer data for question ${questionId}, skipping`);
          continue;
        }
        
        try {
          // Build payload based on question type
          let payload: any = {};
          switch (question.question_type) {
            case 'multiple-choice':
              payload.selected_option_id = answerData.mcq_option_id;
              break;
            case 'textarea':
            case 'written':
            case 'email':
              payload.answer_text = answerData.text_answer;
              break;
            case 'likert':
              payload.likert_value = answerData.likert_rating;
              break;
            case 'video':
              payload.video_response_path = answerData.video_response_path;
              break;
            default:
              // fallback: only send text_response if present
              if (answerData.text_answer) payload.answer_text = answerData.text_answer;
          }
          
          // Skip if no valid data to save
          if (Object.keys(payload).length === 0) {
            console.log(`[DEBUG-PART] No valid data for question ${questionId}, skipping`);
            continue;
          }
          
          if (answerData.id) {
            // Update existing answer
            console.log(`[DEBUG-PART] Updating answer for question ${questionId}`);
            const { error: updateError } = await supabase
              .from('user_answers')
              .update(payload)
              .eq('id', answerData.id);
            if (updateError) {
              console.error('[DEBUG-PART] Error updating answer:', updateError);
              throw new Error(`Failed to update answer: ${updateError.message}`);
            }
          } else {
            // Insert new answer
            payload.attempt_id = numericAttemptId;
            payload.question_id = parseInt(questionId);
            console.log(`[DEBUG-PART] Inserting new answer for question ${questionId}`);
            const { error: insertError } = await supabase
              .from('user_answers')
              .insert(payload);
            if (insertError) {
              console.error('[DEBUG-PART] Error inserting answer:', insertError);
              throw new Error(`Failed to insert answer: ${insertError.message}`);
            }
          }
          processedCount++;
          console.log(`[DEBUG-PART] Processed ${processedCount} answers`);
        } catch (answerError) {
          console.error(`[DEBUG-PART] Error processing answer for question ${questionId}:`, answerError);
        }
      }
      
      console.log(`[DEBUG-PART] Answer processing complete. Successfully processed ${processedCount} answers`);
      
      setTimeout(() => {
        if (submitting) {
          setSubmitting(false);
        }
      }, 8000);
      
      setTimeout(() => {
        setSubmitting(false);
      }, 1000);
      
      try {
        if (typeof onComplete === 'function') {
          await Promise.resolve(onComplete());
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
      if (onBlockChange) {
        onBlockChange(currentBlockIndex + 1, 0, blocks[currentBlockIndex + 1]);
      }
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
    if (onBlockChange) {
      onBlockChange(currentBlockIndex + 1, 0, blocks[currentBlockIndex + 1]);
    }
    window.scrollTo(0, 0);
  };

  const prevBlock = () => {
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
      setCurrentQuestionIndex(0);
      if (onBlockChange) {
        onBlockChange(currentBlockIndex - 1, 0, blocks[currentBlockIndex - 1]);
      }
      window.scrollTo(0, 0);
    }
  };

  const handleQuestionChange = (index: number) => {
    setCurrentQuestionIndex(index);
    if (onBlockChange) {
      onBlockChange(currentBlockIndex, index, blocks[currentBlockIndex]);
    }
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