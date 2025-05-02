import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/assessments/[id]/parts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const assessmentId = params.id;
  
  // First check if the assessment exists
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('id')
    .eq('id', assessmentId)
    .single();
  
  if (assessmentError) {
    if (assessmentError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: assessmentError.message }, { status: 500 });
  }
  
  // Get all parts for this assessment
  const { data, error } = await supabase
    .from('parts')
    .select('id, title, description, sequence_order, created_at')
    .eq('assessment_id', assessmentId)
    .order('sequence_order', { ascending: true });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST /api/admin/assessments/[id]/parts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const assessmentId = params.id;
  const body = await request.json();
  
  // Validate required fields
  if (!body.title) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    );
  }
  
  // First check if the assessment exists
  const { data: assessment, error: assessmentError } = await supabase
    .from('assessments')
    .select('id')
    .eq('id', assessmentId)
    .single();
  
  if (assessmentError) {
    if (assessmentError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: assessmentError.message }, { status: 500 });
  }
  
  // Find the highest sequence_order to place the new part at the end
  const { data: lastPart, error: sequenceError } = await supabase
    .from('parts')
    .select('sequence_order')
    .eq('assessment_id', assessmentId)
    .order('sequence_order', { ascending: false })
    .limit(1)
    .single();
  
  const nextSequence = lastPart ? lastPart.sequence_order + 1 : 1;
  
  // Create the new part
  const { data, error } = await supabase
    .from('parts')
    .insert([{
      assessment_id: assessmentId,
      title: body.title,
      description: body.description || '',
      sequence_order: nextSequence,
    }])
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
} 