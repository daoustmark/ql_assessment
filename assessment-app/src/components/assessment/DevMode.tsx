import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

// Define our own Part interface matching what's used in the page component
interface Part {
  id: number;
  assessment_id: number;
  title: string;
  description: string;
  sequence_order: number;
}

interface DevModeProps {
  parts: Part[];
  attemptId: number;
  currentPartIndex: number;
  onPartSelect: (partIndex: number) => void;
}

export function DevMode({ parts, attemptId, currentPartIndex, onPartSelect }: DevModeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Don't render anything in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const skipToPart = async (partIndex: number) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      onPartSelect(partIndex);
      setIsOpen(false);
    } catch (error) {
      console.error('Error skipping to part:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const autoFillCurrentPart = async () => {
    if (isProcessing || !parts[currentPartIndex]) return;
    
    try {
      setIsProcessing(true);
      const supabase = createClient();
      
      // Get the current part
      const currentPart = parts[currentPartIndex];
      
      // Fetch all questions for the current part's blocks
      const { data: blocks } = await supabase
        .from('blocks')
        .select(`
          id,
          questions (
            id, 
            question_type
          )
        `)
        .eq('part_id', currentPart.id);
      
      if (!blocks) return;
      
      // Extract all question IDs
      const questionIds = blocks.flatMap(block => 
        block.questions?.map(q => ({ 
          id: q.id, 
          type: q.question_type 
        })) || []
      );
      
      // Generate default answers
      const answers = questionIds.map(question => {
        let answerData = {
          attempt_id: attemptId,
          question_id: question.id
        };
        
        switch (question.type) {
          case 'multiple-choice':
            // Mock selecting the first option
            return { ...answerData, mcq_option_id: null, selected_option_id: 1 };
          case 'textarea':
          case 'written':
          case 'email':
            return { ...answerData, text_answer: 'Auto-filled answer for testing' };
          case 'likert':
            return { ...answerData, likert_rating: 3 }; // Middle value
          case 'video':
            return { ...answerData, video_response_path: null };
          default:
            return answerData;
        }
      });
      
      // Bulk insert all answers
      if (answers.length > 0) {
        const { error } = await supabase
          .from('user_answers')
          .upsert(answers, { onConflict: 'attempt_id,question_id' });
        
        if (error) throw error;
      }
      
      // Refresh the page to show the answers
      window.location.reload();
      
    } catch (error) {
      console.error('Error auto-filling part:', error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const completeCurrentPart = () => {
    // Triggers the completion flow for the current part
    document.querySelectorAll('button').forEach(button => {
      if (button.textContent?.includes('Complete') || 
          button.textContent?.includes('Continue') || 
          button.textContent?.includes('Next') || 
          button.textContent?.includes('Submit')) {
        button.click();
      }
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="dropdown dropdown-top dropdown-end">
        <button 
          className="btn btn-sm btn-circle bg-yellow-400 text-black hover:bg-yellow-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-xs font-bold">DEV</span>
        </button>
        
        {isOpen && (
          <div className="dropdown-content p-2 shadow bg-base-100 rounded-box w-72">
            <div className="flex flex-col gap-2">
              <div className="text-sm font-bold text-center text-gray-500 mb-2">
                DEVELOPMENT TOOLS
              </div>
              
              <button 
                className="btn btn-sm btn-warning w-full"
                onClick={autoFillCurrentPart}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Auto-fill Current Part'}
              </button>
              
              <button 
                className="btn btn-sm btn-warning w-full"
                onClick={completeCurrentPart}
                disabled={isProcessing}
              >
                Complete Current Part
              </button>
              
              <div className="divider text-xs text-gray-500">SKIP TO PART</div>
              
              <div className="max-h-48 overflow-y-auto">
                {parts.map((part, index) => (
                  <button 
                    key={part.id}
                    className={`btn btn-sm w-full mb-1 justify-start ${index === currentPartIndex ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => skipToPart(index)}
                    disabled={isProcessing}
                  >
                    <span className="text-xs mr-2">{index + 1}.</span>
                    {part.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 