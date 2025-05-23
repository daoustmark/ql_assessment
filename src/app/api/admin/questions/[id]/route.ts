import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const questionId = parseInt(id)

    if (!questionId || isNaN(questionId)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      )
    }

    // First check if the question exists
    const { data: existingQuestion, error: checkError } = await supabaseAdmin
      .from('questions')
      .select('id')
      .eq('id', questionId)
      .single()

    if (checkError || !existingQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      )
    }

    // Delete any MCQ options (they should cascade delete automatically due to foreign key constraints,
    // but we'll be explicit to ensure clean deletion)
    const { error: optionsError } = await supabaseAdmin
      .from('mcq_options')
      .delete()
      .eq('question_id', questionId)

    if (optionsError) {
      console.error('Error deleting MCQ options:', optionsError)
      // Continue anyway, as the question deletion might still work
    }

    // Delete any user answers for this question
    const { error: answersError } = await supabaseAdmin
      .from('user_answers')
      .delete()
      .eq('question_id', questionId)

    if (answersError) {
      console.error('Error deleting user answers:', answersError)
      // Continue anyway
    }

    // Delete the question itself
    const { error: questionError } = await supabaseAdmin
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (questionError) {
      console.error('Error deleting question:', questionError)
      return NextResponse.json(
        { error: 'Failed to delete question' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/admin/questions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const questionId = parseInt(id)
    const body = await request.json()

    if (!questionId || isNaN(questionId)) {
      return NextResponse.json(
        { error: 'Invalid question ID' },
        { status: 400 }
      )
    }

    const {
      question_text,
      question_type,
      is_required,
      time_limit,
      points = 1.0,
      correct_answer = null,
      mcq_options = []
    } = body

    // Update the question
    const { data: question, error: questionError } = await supabaseAdmin
      .from('questions')
      .update({
        question_text,
        question_type,
        is_required,
        time_limit,
        points,
        correct_answer
      })
      .eq('id', questionId)
      .select()
      .single()

    if (questionError) {
      console.error('Error updating question:', questionError)
      return NextResponse.json(
        { error: 'Failed to update question' },
        { status: 500 }
      )
    }

    // Handle MCQ options update if it's a multiple choice question
    let questionWithOptions = question
    if (question_type === 'multiple_choice') {
      // Delete existing options
      await supabaseAdmin
        .from('mcq_options')
        .delete()
        .eq('question_id', questionId)

      // Insert new options if any
      if (mcq_options.length > 0) {
        const optionsToInsert = mcq_options.map((option: any, index: number) => ({
          question_id: questionId,
          option_text: option.option_text,
          sequence_order: index + 1,
          is_correct: option.is_correct || false
        }))

        const { data: options, error: optionsError } = await supabaseAdmin
          .from('mcq_options')
          .insert(optionsToInsert)
          .select()

        if (!optionsError) {
          questionWithOptions = {
            ...question,
            mcq_options: options
          }
        }
      }
    }

    return NextResponse.json(questionWithOptions)
  } catch (error) {
    console.error('Error in PATCH /api/admin/questions/[id]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 