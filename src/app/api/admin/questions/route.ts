import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      block_id,
      question_text,
      question_type,
      is_required = true,
      time_limit = null,
      points = 1.0,
      correct_answer = null,
      mcq_options = []
    } = body

    // Validate required fields
    if (!block_id || !question_text || !question_type) {
      return NextResponse.json(
        { error: 'Missing required fields: block_id, question_text, question_type' },
        { status: 400 }
      )
    }

    // Get the next sequence order for this block
    const { data: maxSequence } = await supabaseAdmin
      .from('questions')
      .select('sequence_order')
      .eq('block_id', block_id)
      .order('sequence_order', { ascending: false })
      .limit(1)
      .single()

    const sequence_order = (maxSequence?.sequence_order || 0) + 1

    // Insert the question
    const { data: question, error: questionError } = await supabaseAdmin
      .from('questions')
      .insert({
        block_id,
        question_text,
        question_type,
        sequence_order,
        is_required,
        time_limit,
        points,
        correct_answer
      })
      .select()
      .single()

    if (questionError) {
      console.error('Error creating question:', questionError)
      return NextResponse.json(
        { error: 'Failed to create question' },
        { status: 500 }
      )
    }

    // If it's a multiple choice question, insert the options
    let questionWithOptions = question
    if (question_type === 'multiple_choice' && mcq_options.length > 0) {
      const optionsToInsert = mcq_options.map((option: any, index: number) => ({
        question_id: question.id,
        option_text: option.option_text,
        sequence_order: index + 1,
        is_correct: option.is_correct || false
      }))

      const { data: options, error: optionsError } = await supabaseAdmin
        .from('mcq_options')
        .insert(optionsToInsert)
        .select()

      if (optionsError) {
        console.error('Error creating MCQ options:', optionsError)
        // Don't fail the whole request, but log the error
      } else {
        questionWithOptions = {
          ...question,
          mcq_options: options
        }
      }
    }

    return NextResponse.json(questionWithOptions)
  } catch (error) {
    console.error('Error in POST /api/admin/questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 