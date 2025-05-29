require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function verifyTestData() {
  console.log('🔍 Verifying test assessment data...\n')

  try {
    // Get all assessment attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from('assessment_attempts')
      .select(`
        *,
        user_answers (*)
      `)
      .order('id', { ascending: true })

    if (attemptsError) {
      console.error('Error fetching attempts:', attemptsError)
      return
    }

    console.log(`📊 Found ${attempts.length} assessment attempts:\n`)

    for (const attempt of attempts) {
      const status = attempt.completed_at ? '✅ Complete' : '⏸️  Partial'
      const scoreDisplay = attempt.score !== null 
        ? `${attempt.score} points (${attempt.percentage}%)` 
        : 'Not scored'
      const passStatus = attempt.passed === null 
        ? 'Not evaluated' 
        : (attempt.passed ? 'PASSED' : 'FAILED')

      console.log(`👤 ${attempt.invitee_name || 'Unknown'} (ID: ${attempt.id})`)
      console.log(`   📧 Email: ${attempt.invitee_email || 'Not provided'}`)
      console.log(`   📅 Started: ${new Date(attempt.started_at).toLocaleDateString()}`)
      console.log(`   ${status} | ${scoreDisplay} | ${passStatus}`)
      console.log(`   📝 Answered: ${attempt.user_answers.length} questions`)
      
      if (attempt.completed_at) {
        const completedDate = new Date(attempt.completed_at)
        console.log(`   ✅ Completed: ${completedDate.toLocaleDateString()} at ${completedDate.toLocaleTimeString()}`)
      }
      console.log('')
    }

    // Summary statistics
    const completed = attempts.filter(a => a.completed_at !== null).length
    const passed = attempts.filter(a => a.passed === true).length
    const failed = attempts.filter(a => a.passed === false).length
    
    const totalAnswers = attempts.reduce((sum, a) => sum + a.user_answers.length, 0)
    const avgScore = attempts
      .filter(a => a.percentage !== null)
      .reduce((sum, a, _, arr) => sum + (a.percentage / arr.length), 0)

    console.log('📈 Summary Statistics:')
    console.log('=' .repeat(50))
    console.log(`Total Attempts: ${attempts.length}`)
    console.log(`Completed: ${completed}`)
    console.log(`Partial/Abandoned: ${attempts.length - completed}`)
    console.log(`Passed: ${passed}`)
    console.log(`Failed: ${failed}`)
    console.log(`Total Answers: ${totalAnswers}`)
    console.log(`Average Score: ${avgScore.toFixed(1)}%`)

    // Check question type distribution
    console.log('\n🧩 Question Type Response Analysis:')
    console.log('=' .repeat(50))

    const { data: answerStats, error: statsError } = await supabase
      .from('user_answers')
      .select(`
        *,
        questions (question_type)
      `)
      .not('questions', 'is', null)

    if (!statsError && answerStats) {
      const typeStats = {}
      
      for (const answer of answerStats) {
        const type = answer.questions.question_type
        if (!typeStats[type]) {
          typeStats[type] = {
            total: 0,
            correct: 0,
            withAnswers: 0
          }
        }
        
        typeStats[type].total++
        if (answer.is_correct === true) typeStats[type].correct++
        
        // Check if answer has content
        if (answer.mcq_option_id || answer.text_answer || answer.likert_rating || answer.video_response_path) {
          typeStats[type].withAnswers++
        }
      }

      for (const [type, stats] of Object.entries(typeStats)) {
        const accuracy = stats.total > 0 ? ((stats.correct / stats.total) * 100).toFixed(1) : '0.0'
        console.log(`${type.padEnd(20)}: ${stats.total} answers, ${stats.correct} correct (${accuracy}%), ${stats.withAnswers} with content`)
      }
    }

    // Show sample responses for different types
    console.log('\n📝 Sample Responses:')
    console.log('=' .repeat(50))

    // Get some sample text responses
    const { data: textResponses, error: textError } = await supabase
      .from('user_answers')
      .select(`
        text_answer,
        questions (question_type),
        assessment_attempts (invitee_name)
      `)
      .not('text_answer', 'is', null)
      .limit(3)

    if (!textError && textResponses) {
      for (const response of textResponses) {
        console.log(`\n${response.questions.question_type} response from ${response.assessment_attempts.invitee_name}:`)
        console.log(`"${response.text_answer.substring(0, 200)}${response.text_answer.length > 200 ? '...' : ''}"`)
      }
    }

    // Get some Likert responses
    const { data: likertResponses, error: likertError } = await supabase
      .from('user_answers')
      .select(`
        likert_rating,
        assessment_attempts (invitee_name)
      `)
      .not('likert_rating', 'is', null)
      .limit(10)

    if (!likertError && likertResponses) {
      console.log('\n📊 Likert Scale Responses:')
      const ratings = likertResponses.map(r => r.likert_rating)
      const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      console.log(`Average rating: ${avg.toFixed(1)} (from ${ratings.length} responses)`)
      console.log(`Range: ${Math.min(...ratings)} - ${Math.max(...ratings)}`)
    }

  } catch (error) {
    console.error('❌ Error verifying test data:', error)
  }
}

if (require.main === module) {
  verifyTestData()
}

module.exports = { verifyTestData } 