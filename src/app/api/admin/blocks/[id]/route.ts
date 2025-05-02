import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/blocks/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  
  const { data, error } = await supabase
    .from('blocks')
    .select('id, title, description, block_type, sequence_order, part_id')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// PUT /api/admin/blocks/[id]
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
  
  if (!body.block_type) {
    return NextResponse.json(
      { error: 'Block type is required' },
      { status: 400 }
    );
  }
  
  const { data, error } = await supabase
    .from('blocks')
    .update({
      title: body.title,
      description: body.description || '',
      block_type: body.block_type,
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// DELETE /api/admin/blocks/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const id = params.id;
  
  // Check if the block exists
  const { data: existingData, error: existingError } = await supabase
    .from('blocks')
    .select('id')
    .eq('id', id)
    .single();
  
  if (existingError) {
    if (existingError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Block not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }
  
  // Delete the block
  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('id', id);
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true }, { status: 200 });
} 