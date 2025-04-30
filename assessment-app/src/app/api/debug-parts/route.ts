import { supabaseAdmin } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Fetch all assessments
    const { data: assessments, error: assessmentsError } = await supabaseAdmin
      .from('assessments')
      .select('*');
      
    if (assessmentsError) {
      throw new Error(`Failed to fetch assessments: ${assessmentsError.message}`);
    }
    
    // Fetch all parts
    const { data: parts, error: partsError } = await supabaseAdmin
      .from('parts')
      .select('*')
      .order('sequence_order');
      
    if (partsError) {
      throw new Error(`Failed to fetch parts: ${partsError.message}`);
    }
    
    return NextResponse.json({
      success: true,
      assessments,
      parts,
      partsCount: parts.length,
      assessmentsCount: assessments.length
    });
  } catch (error: any) {
    console.error('Error in debug route:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
} 