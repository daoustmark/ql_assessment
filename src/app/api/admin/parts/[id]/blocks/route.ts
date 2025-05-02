import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/parts/[id]/blocks
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const partId = params.id;
  
  // First check if the part exists
  const { data: part, error: partError } = await supabase
    .from('parts')
    .select('id')
    .eq('id', partId)
    .single();
  
  if (partError) {
    if (partError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Part not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: partError.message }, { status: 500 });
  }
  
  // Get all blocks for this part
  const { data, error } = await supabase
    .from('blocks')
    .select('id, title, description, block_type, sequence_order, created_at')
    .eq('part_id', partId)
    .order('sequence_order', { ascending: true });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST /api/admin/parts/[id]/blocks
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const partId = params.id;
  const body = await request.json();
  
  // Validate required fields
  if (!body.title) {
    return NextResponse.json(
      { error: 'Title is required' },
      { status: 400 }
    );
  }
  
  if (!body.block_type) {
    return NextResponse.json(
      { error: 'Block type is required' },
      { status: 400 }
    );
  }
  
  // First check if the part exists
  const { data: part, error: partError } = await supabase
    .from('parts')
    .select('id')
    .eq('id', partId)
    .single();
  
  if (partError) {
    if (partError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Part not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: partError.message }, { status: 500 });
  }
  
  // Find the highest sequence_order to place the new block at the end
  const { data: lastBlock, error: sequenceError } = await supabase
    .from('blocks')
    .select('sequence_order')
    .eq('part_id', partId)
    .order('sequence_order', { ascending: false })
    .limit(1)
    .single();
  
  const nextSequence = lastBlock ? lastBlock.sequence_order + 1 : 1;
  
  // Create the new block
  const { data, error } = await supabase
    .from('blocks')
    .insert([{
      part_id: partId,
      title: body.title,
      description: body.description || '',
      block_type: body.block_type,
      sequence_order: nextSequence,
    }])
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
} 