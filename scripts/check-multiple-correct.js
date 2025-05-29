require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkMultipleCorrect() {
  try {
    // Find questions with multiple correct answers
    const { data: questionsWithMultipleCorrect, error } = await supabase
      .from('mcq_options')
      .select(`
        question_id,
        id,
        option_text,
        sequence_order,
        is_correct,
        questions (
          question_text
        )
      `)
      .eq('is_correct', true)
      .order('question_id')
      .order('sequence_order');

    if (error) throw error;

    // Group by question_id to find multiples
    const questionGroups = {};
    questionsWithMultipleCorrect.forEach(option => {
      if (!questionGroups[option.question_id]) {
        questionGroups[option.question_id] = [];
      }
      questionGroups[option.question_id].push(option);
    });

    // Find questions with more than one correct answer
    const problemQuestions = Object.entries(questionGroups).filter(([questionId, options]) => options.length > 1);

    console.log(`📊 Total questions with correct answers: ${Object.keys(questionGroups).length}`);
    console.log(`⚠️  Questions with multiple correct answers: ${problemQuestions.length}`);

    if (problemQuestions.length > 0) {
      console.log('\n🔍 Questions with multiple correct answers:');
      problemQuestions.forEach(([questionId, options]) => {
        console.log(`\nQuestion ${questionId}: ${options[0].questions.question_text.substring(0, 60)}...`);
        options.forEach(option => {
          const letter = String.fromCharCode(97 + option.sequence_order - 1);
          console.log(`  ${letter}) ${option.option_text.substring(0, 80)}...`);
        });
      });

      console.log('\n🛠️  To fix this, we should keep only one correct answer per question.');
      console.log('Would you like me to create a fix script?');
    } else {
      console.log('\n✅ All questions have exactly one correct answer!');
    }

    // Show some stats
    const { data: totalQuestions, error: totalError } = await supabase
      .from('questions')
      .select('id', { count: 'exact' })
      .eq('question_type', 'multiple_choice');

    if (!totalError) {
      console.log(`\n📈 Statistics:`);
      console.log(`   - Total MCQ questions: ${totalQuestions.length}`);
      console.log(`   - Questions with correct answers: ${Object.keys(questionGroups).length}`);
      console.log(`   - Questions missing correct answers: ${totalQuestions.length - Object.keys(questionGroups).length}`);
    }

  } catch (error) {
    console.error('❌ Error checking multiple correct answers:', error.message);
  }
}

if (require.main === module) {
  checkMultipleCorrect();
}

module.exports = checkMultipleCorrect; 