'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { VideoRecorder } from './VideoRecorder';
import { BlockRenderer } from './BlockRenderer';
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
              text_answer: answerData.text_answer,
              mcq_option_id: answerData.mcq_option_id,
              likert_rating: answerData.likert_rating,
              video_response_path: answerData.video_response_path,
              answered_at: new Date().toISOString()
            })
            .eq('id', answerData.id);
        } else {
          // Insert new answer
          await supabase
            .from('user_answers')
            .insert({
              attempt_id: numericAttemptId,
              question_id: parseInt(questionId),
              text_answer: answerData.text_answer,
              mcq_option_id: answerData.mcq_option_id,
              likert_rating: answerData.likert_rating,
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
    } else {
      handleSubmit();
    }
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
      <Card colorAccent="blue" className="animate-slide-in-up">
        <div className="text-center text-error">
          {error}
        </div>
      </Card>
    );
  }

  if (blocks.length === 0) {
    return (
      <Card colorAccent="blue" className="animate-slide-in-up">
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
            <p className="text-sm text-gray-600 mt-1">{currentBlock?.title || "Current Block"}</p>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900">
          Foundational Knowledge
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