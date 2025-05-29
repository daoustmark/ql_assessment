require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Import the correct answer updater logic
const CorrectAnswerUpdater = require('./update-correct-answers.js');

class CorrectAnswerFixer extends CorrectAnswerUpdater {
  async resetAllCorrectAnswers() {
    console.log('🔄 Resetting all correct answers to FALSE...');
    
    const { error } = await supabase
      .from('mcq_options')
      .update({ is_correct: false })
      .neq('id', 0); // Update all records

    if (error) {
      throw new Error(`Error resetting correct answers: ${error.message}`);
    }

    console.log('✅ All correct answers reset to FALSE');
  }

  async fixMultipleCorrectAnswers(dryRun = true) {
    try {
      if (dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made');
      } else {
        // Step 1: Reset all correct answers
        await this.resetAllCorrectAnswers();
      }

      // Step 2: Parse questions from markdown
      const questionsFile = require('path').join(__dirname, '../backup/questions.md');
      this.parseQuestionsFile(questionsFile);
      
      // Step 3: Match to database
      await this.matchQuestionsToDatabase();
      
      // Step 4: Apply correct answers (ensuring only one per question)
      await this.updateDatabaseSingle(dryRun);
      
      // Step 5: Verify results
      await this.verifyResults();
      
      console.log('\n✅ Process completed successfully!');
      
    } catch (error) {
      console.error('❌ Process failed:', error.message);
      throw error;
    }
  }

  async updateDatabaseSingle(dryRun = true) {
    console.log(`${dryRun ? 'DRY RUN: ' : ''}Applying correct answers (one per question)...`);
    
    // Group matches by question to ensure only one correct answer per question
    const questionAnswers = {};
    
    for (const match of this.matchedQuestions) {
      const questionId = match.dbQuestion.id;
      
      // If we already have an answer for this question, skip duplicates
      if (questionAnswers[questionId]) {
        console.log(`⚠️  Skipping duplicate answer for question ${questionId}`);
        continue;
      }
      
      questionAnswers[questionId] = match;
    }

    const uniqueMatches = Object.values(questionAnswers);
    console.log(`📝 Processing ${uniqueMatches.length} unique questions (${this.matchedQuestions.length - uniqueMatches.length} duplicates skipped)`);

    if (dryRun) {
      for (const match of uniqueMatches) {
        console.log(`Would update option ${match.correctOptionId} for question ${match.dbQuestion.id}: ${match.dbQuestion.question_text.substring(0, 50)}...`);
      }
      return uniqueMatches.length;
    }

    // Execute actual updates
    const updates = [];
    for (const match of uniqueMatches) {
      const { error } = await supabase
        .from('mcq_options')
        .update({ is_correct: true })
        .eq('id', match.correctOptionId);

      if (error) {
        console.error(`Error updating option ${match.correctOptionId}:`, error.message);
        this.errors.push(`Update failed for option ${match.correctOptionId}: ${error.message}`);
      } else {
        updates.push(match.correctOptionId);
        console.log(`✅ Updated option ${match.correctOptionId} for question ${match.dbQuestion.id}`);
      }
    }

    console.log(`Successfully updated ${updates.length} options`);
    return updates.length;
  }

  async verifyResults() {
    console.log('\n🔍 Verification:');
    
    // Check for multiple correct answers
    const { data: questionsWithCorrect, error } = await supabase
      .from('mcq_options')
      .select('question_id')
      .eq('is_correct', true);

    if (error) throw error;

    // Count occurrences per question
    const questionCounts = {};
    questionsWithCorrect.forEach(option => {
      questionCounts[option.question_id] = (questionCounts[option.question_id] || 0) + 1;
    });

    const multipleCorrect = Object.entries(questionCounts).filter(([id, count]) => count > 1);
    
    if (multipleCorrect.length > 0) {
      console.log(`❌ Found ${multipleCorrect.length} questions with multiple correct answers:`);
      multipleCorrect.forEach(([questionId, count]) => {
        console.log(`   Question ${questionId}: ${count} correct answers`);
      });
    } else {
      console.log(`✅ Verification passed: ${Object.keys(questionCounts).length} questions, each with exactly 1 correct answer`);
    }

    return multipleCorrect.length === 0;
  }
}

async function main() {
  const fixer = new CorrectAnswerFixer();
  
  try {
    const dryRun = process.argv.includes('--dry-run') || !process.argv.includes('--execute');
    
    if (dryRun) {
      console.log('🔍 Running in DRY RUN mode. Use --execute to actually fix the database.');
    }

    await fixer.fixMultipleCorrectAnswers(dryRun);
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = CorrectAnswerFixer; 