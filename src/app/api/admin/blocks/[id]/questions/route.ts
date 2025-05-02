import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/blocks/[id]/questions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const blockId = params.id;
  
  // First check if the block exists
  const { data: block, error: blockError } = await supabase
    .from('blocks')
    .select('id')
    .eq('id', blockId)
    .single();
  
  if (blockError) {
    if (blockError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: blockError.message }, { status: 500 });
  }
  
  // Get all questions for this block
  const { data, error } = await supabase
    .from('questions')
    .select('id, question_text, question_type, sequence_order, is_required, created_at')
    .eq('block_id', blockId)
    .order('sequence_order', { ascending: true });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST /api/admin/blocks/[id]/questions
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const blockId = params.id;
  const body = await request.json();
  
  // Validate required fields
  if (!body.question_text) {
    return NextResponse.json(
      { error: 'Question text is required' },
      { status: 400 }
    );
  }
  
  if (!body.question_type) {
    return NextResponse.json(
      { error: 'Question type is required' },
      { status: 400 }
    );
  }
  
  // First check if the block exists
  const { data: block, error: blockError } = await supabase
    .from('blocks')
    .select('id')
    .eq('id', blockId)
    .single();
  
  if (blockError) {
    if (blockError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: blockError.message }, { status: 500 });
  }
  
  // Find the highest sequence_order to place the new question at the end
  const { data: lastQuestion, error: sequenceError } = await supabase
    .from('questions')
    .select('sequence_order')
    .eq('block_id', blockId)
    .order('sequence_order', { ascending: false })
    .limit(1)
    .single();
  
  const nextSequence = lastQuestion ? lastQuestion.sequence_order + 1 : 1;
  
  // Create the new question
  const { data, error } = await supabase
    .from('questions')
    .insert([{
      block_id: blockId,
      question_text: body.question_text,
      question_type: body.question_type,
      is_required: body.is_required === undefined ? true : body.is_required,
      sequence_order: nextSequence,
    }])
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
} 