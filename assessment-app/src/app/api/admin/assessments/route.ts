import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/assessments
export async function GET() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('assessments')
    .select('id, title, description, created_at')
    .order('created_at', { ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

// POST /api/admin/assessments
export async function POST(request: NextRequest) {
  const supabase = createClient();
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
    .insert([{
      title: body.title,
      description: body.description || '',
    }])
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data, { status: 201 });
} 