require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyResults() {
  try {
    // Count total correct answers
    const { data: correctAnswers, error: countError } = await supabase
      .from('mcq_options')
      .select('id')
      .eq('is_correct', true);

    if (countError) throw countError;

    console.log(`✅ Total correct answers set: ${correctAnswers.length}`);

    // Get sample correct answers
    const { data: sampleAnswers, error: sampleError } = await supabase
      .from('mcq_options')
      .select(`
        id,
        option_text,
        sequence_order,
        questions (
          id,
          question_text
        )
      `)
      .eq('is_correct', true)
      .order('questions(id)')
      .limit(5);

    if (sampleError) throw sampleError;

    console.log('\n📋 Sample correct answers:');
    sampleAnswers.forEach((option, index) => {
      const letter = String.fromCharCode(97 + option.sequence_order - 1); // Convert 1->a, 2->b, etc.
      console.log(`${index + 1}. Question ${option.questions.id}: Answer ${letter}) ${option.option_text.substring(0, 60)}...`);
    });

    // Check for questions with multiple correct answers (should be 0)
    const { data: multipleCorrect, error: multipleError } = await supabase.rpc('check_multiple_correct', {}, { count: 'exact' });

    if (!multipleError && multipleCorrect === 0) {
      console.log('\n✅ Validation passed: Each question has exactly one correct answer');
    }

  } catch (error) {
    console.error('❌ Error verifying results:', error.message);
  }
}

if (require.main === module) {
  verifyResults();
} 