import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Assessment, 
  Part, 
  Block, 
  Question, 
  AssessmentAttempt, 
  UserAnswer 
} from '@/types/assessment';

export function useAssessment(assessmentId?: number, attemptId?: number) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [parts, setParts] = useState<Part[]>([]);
  const [currentPart, setCurrentPart] = useState<Part | null>(null);
  const [currentBlock, setCurrentBlock] = useState<Block | null>(null);
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [answers, setAnswers] = useState<Record<number, UserAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  // Fetch assessment data
  useEffect(() => {
    if (!assessmentId) return;
    
    async function fetchAssessment() {
      try {
        setLoading(true);
        
        // Fetch the assessment
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .eq('id', assessmentId)
          .single();
          
        if (assessmentError) throw assessmentError;
        setAssessment(assessmentData as Assessment);
        
        // Fetch parts with blocks and questions
        const { data: partsData, error: partsError } = await supabase
          .from('parts')
          .select(`
            id, title, description, sequence_order, created_at, assessment_id,
            blocks (
              id, title, description, block_type, sequence_order, created_at, part_id,
              questions (
                id, question_text, question_type, sequence_order, is_required, created_at, block_id,
                mcq_options (id, option_text, sequence_order, question_id),
                likert_statements (id, statement_text, sequence_order, question_id)
              ),
              scenarios (
                id, scenario_text, sequence_order, created_at, block_id,
                scenario_options (id, option_text, sequence_order, scenario_id)
              )
            )
          `)
          .eq('assessment_id', assessmentId)
          .order('sequence_order');
          
        if (partsError) throw partsError;
        
        // Sort blocks within parts by sequence_order
        const sortedParts = partsData.map(part => ({
          ...part,
          blocks: part.blocks?.sort((a, b) => a.sequence_order - b.sequence_order)
        })) as Part[];
        
        setParts(sortedParts);
        
        // Set initial current part and block
        if (sortedParts.length > 0) {
          setCurrentPart(sortedParts[0]);
          if (sortedParts[0].blocks && sortedParts[0].blocks.length > 0) {
            setCurrentBlock(sortedParts[0].blocks[0]);
          }
        }
        
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError('Failed to load assessment data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchAssessment();
  }, [assessmentId, supabase]);
  
  // Fetch or create attempt
  useEffect(() => {
    if (!assessmentId) return;
    
    async function getOrCreateAttempt() {
      try {
        if (attemptId) {
          // If attempt ID is provided, fetch existing attempt
          const { data: attemptData, error: attemptError } = await supabase
            .from('assessment_attempts')
            .select('*')
            .eq('id', attemptId)
            .single();
            
          if (attemptError) throw attemptError;
          setAttempt(attemptData as AssessmentAttempt);
          
          // Fetch user's existing answers for this attempt
          const { data: answersData, error: answersError } = await supabase
            .from('user_answers')
            .select('*')
            .eq('attempt_id', attemptId);
            
          if (answersError) throw answersError;
          
          // Convert answers array to record indexed by question_id
          const answersRecord = (answersData as UserAnswer[]).reduce((acc, answer) => {
            acc[answer.question_id] = answer;
            return acc;
          }, {} as Record<number, UserAnswer>);
          
          setAnswers(answersRecord);
        } else {
          // Create a new attempt
          const { data: userData } = await supabase.auth.getUser();
          
          if (!userData.user) {
            throw new Error('User not authenticated');
          }
          
          const { data: newAttempt, error: createError } = await supabase
            .from('assessment_attempts')
            .insert({
              user_id: userData.user.id,
              assessment_id: assessmentId,
              start_time: new Date().toISOString(),
              status: 'in_progress'
            })
            .select()
            .single();
            
          if (createError) throw createError;
          setAttempt(newAttempt as AssessmentAttempt);
        }
      } catch (err) {
        console.error('Error with assessment attempt:', err);
        setError('Failed to start or resume assessment');
      }
    }
    
    getOrCreateAttempt();
  }, [assessmentId, attemptId, supabase]);
  
  // Navigate to next or previous block/part
  const navigateToNextBlock = () => {
    if (!currentPart || !currentBlock) return;
    
    const currentPartIndex = parts.findIndex(p => p.id === currentPart.id);
    const currentBlockIndex = currentPart.blocks?.findIndex(b => b.id === currentBlock.id) ?? -1;
    
    if (currentBlockIndex < (currentPart.blocks?.length ?? 0) - 1) {
      // Move to next block in current part
      setCurrentBlock(currentPart.blocks?.[currentBlockIndex + 1] ?? null);
    } else if (currentPartIndex < parts.length - 1) {
      // Move to first block of next part
      const nextPart = parts[currentPartIndex + 1];
      setCurrentPart(nextPart);
      setCurrentBlock(nextPart.blocks?.[0] ?? null);
    }
  };
  
  const navigateToPreviousBlock = () => {
    if (!currentPart || !currentBlock) return;
    
    const currentPartIndex = parts.findIndex(p => p.id === currentPart.id);
    const currentBlockIndex = currentPart.blocks?.findIndex(b => b.id === currentBlock.id) ?? -1;
    
    if (currentBlockIndex > 0) {
      // Move to previous block in current part
      setCurrentBlock(currentPart.blocks?.[currentBlockIndex - 1] ?? null);
    } else if (currentPartIndex > 0) {
      // Move to last block of previous part
      const prevPart = parts[currentPartIndex - 1];
      setCurrentPart(prevPart);
      setCurrentBlock(prevPart.blocks?.[prevPart.blocks?.length - 1] ?? null);
    }
  };
  
  // Save an answer
  const saveAnswer = async (answer: Partial<UserAnswer>) => {
    if (!attempt) return null;
    
    try {
      const fullAnswer: UserAnswer = {
        attempt_id: attempt.id,
        question_id: answer.question_id!,
        ...answer
      };
      
      const { data, error } = await supabase
        .from('user_answers')
        .upsert(fullAnswer)
        .select()
        .single();
        
      if (error) throw error;
      
      // Update local answers state
      setAnswers(prev => ({
        ...prev,
        [answer.question_id!]: data as UserAnswer
      }));
      
      return data as UserAnswer;
    } catch (err) {
      console.error('Error saving answer:', err);
      return null;
    }
  };
  
  // Complete the assessment
  const completeAssessment = async () => {
    if (!attempt) return false;
    
    try {
      const { error } = await supabase
        .from('assessment_attempts')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', attempt.id);
        
      if (error) throw error;
      
      setAttempt(prev => prev ? {
        ...prev,
        end_time: new Date().toISOString(),
        status: 'completed'
      } : null);
      
      return true;
    } catch (err) {
      console.error('Error completing assessment:', err);
      return false;
    }
  };
  
  return {
    assessment,
    parts,
    currentPart,
    currentBlock,
    attempt,
    answers,
    loading,
    error,
    navigateToNextBlock,
    navigateToPreviousBlock,
    saveAnswer,
    completeAssessment
  };
} 