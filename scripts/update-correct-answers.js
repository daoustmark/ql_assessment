// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

class CorrectAnswerUpdater {
  constructor() {
    this.parsedQuestions = [];
    this.matchedQuestions = [];
    this.errors = [];
  }

  // Parse the questions.md file
  parseQuestionsFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // Split by question numbers (### followed by number)
    const questionBlocks = content.split(/### \d+\./).filter(block => block.trim());
    
    console.log(`Found ${questionBlocks.length} question blocks`);
    
    questionBlocks.forEach((block, index) => {
      try {
        const parsed = this.parseQuestionBlock(block, index + 1);
        if (parsed) {
          this.parsedQuestions.push(parsed);
        }
      } catch (error) {
        console.error(`Error parsing question ${index + 1}:`, error.message);
        this.errors.push(`Question ${index + 1}: ${error.message}`);
      }
    });

    console.log(`Successfully parsed ${this.parsedQuestions.length} questions`);
    return this.parsedQuestions;
  }

  parseQuestionBlock(block, questionNumber) {
    const lines = block.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return null;
    
    // Extract question text (first non-empty line)
    const questionText = lines[0].trim();
    
    // Extract options (lines starting with a), b), c), etc.)
    const options = [];
    const optionRegex = /^([a-e])\)\s*(.+)$/;
    
    for (const line of lines) {
      const match = line.trim().match(optionRegex);
      if (match) {
        options.push({
          letter: match[1],
          text: match[2].trim()
        });
      }
    }

    // Find the correct answer from the answer section
    const correctAnswer = this.extractCorrectAnswer(block);
    
    if (!correctAnswer) {
      throw new Error(`No correct answer found for question: ${questionText.substring(0, 50)}...`);
    }

    return {
      questionNumber,
      questionText: questionText,
      options,
      correctAnswerLetter: correctAnswer,
      rawBlock: block
    };
  }

  extractCorrectAnswer(block) {
    // Look for the answer section marked with **X.** where X is the correct letter
    const answerMatch = block.match(/\*\*([a-e])\.\s/);
    if (answerMatch) {
      return answerMatch[1].toLowerCase();
    }

    // Alternative pattern: look for "> **Answer**" followed by the correct option
    const answerSectionMatch = block.match(/>\s*\*\*Answer\*\*\s*\n.*?\*\*([a-e])\./s);
    if (answerSectionMatch) {
      return answerSectionMatch[1].toLowerCase();
    }

    return null;
  }

  // Find similar text using a simple similarity score
  calculateSimilarity(str1, str2) {
    // Simple word-based similarity
    const words1 = str1.toLowerCase().split(/\s+/);
    const words2 = str2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  // Match parsed questions to database questions
  async matchQuestionsToDatabase() {
    console.log('Fetching questions from database...');
    
    // Fetch all questions with their options
    const { data: dbQuestions, error } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_type,
        mcq_options (
          id,
          option_text,
          sequence_order
        )
      `)
      .eq('question_type', 'multiple_choice');

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Found ${dbQuestions.length} multiple choice questions in database`);

    // Match each parsed question to database questions
    for (const parsedQ of this.parsedQuestions) {
      let bestMatch = null;
      let bestScore = 0;

      for (const dbQ of dbQuestions) {
        const similarity = this.calculateSimilarity(parsedQ.questionText, dbQ.question_text);
        
        if (similarity > bestScore && similarity > 0.7) { // 70% similarity threshold
          bestScore = similarity;
          bestMatch = dbQ;
        }
      }

      if (bestMatch) {
        // Find the matching option
        const correctOption = bestMatch.mcq_options.find((opt, index) => {
          const expectedLetter = String.fromCharCode(97 + opt.sequence_order - 1); // Convert 1->a, 2->b, etc.
          return expectedLetter === parsedQ.correctAnswerLetter;
        });

        if (correctOption) {
          this.matchedQuestions.push({
            parsedQuestion: parsedQ,
            dbQuestion: bestMatch,
            correctOptionId: correctOption.id,
            similarity: bestScore
          });
        } else {
          this.errors.push(`No matching option found for question ${parsedQ.questionNumber}: ${parsedQ.questionText.substring(0, 50)}...`);
        }
      } else {
        this.errors.push(`No database match found for question ${parsedQ.questionNumber}: ${parsedQ.questionText.substring(0, 50)}...`);
      }
    }

    console.log(`Matched ${this.matchedQuestions.length} questions successfully`);
    return this.matchedQuestions;
  }

  // Update database with correct answers
  async updateDatabase(dryRun = true) {
    console.log(`${dryRun ? 'DRY RUN: ' : ''}Updating database with correct answers...`);
    
    if (dryRun) {
      for (const match of this.matchedQuestions) {
        console.log(`Would update option ${match.correctOptionId} for question: ${match.dbQuestion.question_text.substring(0, 50)}...`);
      }
      return this.matchedQuestions.length;
    }

    // Execute actual updates
    const updates = [];
    for (const match of this.matchedQuestions) {
      const { error } = await supabase
        .from('mcq_options')
        .update({ is_correct: true })
        .eq('id', match.correctOptionId);

      if (error) {
        console.error(`Error updating option ${match.correctOptionId}:`, error.message);
        this.errors.push(`Update failed for option ${match.correctOptionId}: ${error.message}`);
      } else {
        updates.push(match.correctOptionId);
        console.log(`✅ Updated option ${match.correctOptionId}`);
      }
    }

    console.log(`Successfully updated ${updates.length} options`);
    return updates.length;
  }

  // Generate report
  generateReport() {
    console.log('\n=== CORRECT ANSWERS UPDATE REPORT ===');
    console.log(`Parsed questions from markdown: ${this.parsedQuestions.length}`);
    console.log(`Successfully matched to database: ${this.matchedQuestions.length}`);
    console.log(`Errors encountered: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      console.log('\nErrors:');
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (this.matchedQuestions.length > 0) {
      console.log('\nSuccessful matches (sample):');
      this.matchedQuestions.slice(0, 5).forEach((match, index) => {
        console.log(`${index + 1}. Question ${match.parsedQuestion.questionNumber} -> DB ID ${match.dbQuestion.id} (${(match.similarity * 100).toFixed(1)}% similarity)`);
      });
    }
  }
}

// Main execution
async function main() {
  const updater = new CorrectAnswerUpdater();
  
  try {
    // Check if running in dry-run mode
    const dryRun = process.argv.includes('--dry-run') || !process.argv.includes('--execute');
    
    if (dryRun) {
      console.log('Running in DRY RUN mode. Use --execute to actually update the database.');
    }

    // Parse questions from markdown file
    const questionsFile = path.join(__dirname, '../backup/questions.md');
    updater.parseQuestionsFile(questionsFile);
    
    // Match to database
    await updater.matchQuestionsToDatabase();
    
    // Update database
    await updater.updateDatabase(dryRun);
    
    // Generate report
    updater.generateReport();
    
    console.log('\n✅ Process completed successfully!');
    
  } catch (error) {
    console.error('❌ Process failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main();
}

module.exports = CorrectAnswerUpdater; 