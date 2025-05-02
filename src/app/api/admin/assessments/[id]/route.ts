import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/assessments/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  
  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      parts(
        id, 
        title, 
        description, 
        sequence_order,
        blocks(count)
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// PUT /api/admin/assessments/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  const body = await request.json();
  
  // Validate required fields
  if (!body.title) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    );
  }
  
  const { data, error } = await supabase
    .from('assessments')
    .update({
      title: body.title,
      description: body.description || '',
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE /api/admin/assessments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  
  // Check if the assessment exists
  const { data: existingData, error: existingError } = await supabase
    .from('assessments')
    .select('id')
    .eq('id', id)
    .single();
  
  if (existingError) {
    if (existingError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }
  
  // Delete the assessment
  const { error } = await supabase
    .from('assessments')
    .delete()
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 