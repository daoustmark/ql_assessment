// Script to fix specific MCQ options in the database based on screenshot (IDs 1719-1725)
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import * as path from 'path';

// Get current file path for relative references
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: 'assessment-app/.env.local' });

// Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Available' : 'Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'Available' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Function to parse options from combined text
function parseOptions(text) {
  console.log('Parsing text:', text.substring(0, 50) + '...');
  
  const markers = [' b.', ' c.', ' d.', ' e.'];
  let positions = [];
  
  // Find all marker positions
  markers.forEach(marker => {
    const pos = text.indexOf(marker);
    if (pos !== -1) {
      positions.push({ marker, position: pos });
      console.log(`Found marker "${marker}" at position ${pos}`);
    }
  });
  
  // If no markers found, return original text
  if (positions.length === 0) {
    console.log('No markers found, returning original text');
    return [text];
  }
  
  // Sort positions
  positions.sort((a, b) => a.position - b.position);
  
  // Extract options
  const options = [];
  
  // First option is everything before first marker
  const firstOption = text.substring(0, positions[0].position).trim();
  options.push(firstOption);
  console.log(`Extracted first option: "${firstOption.substring(0, 30)}..."`);
  
  // Process remaining options
  positions.forEach((pos, idx) => {
    const start = pos.position + pos.marker.length;
    const end = idx < positions.length - 1 ? positions[idx + 1].position : text.length;
    const optionText = text.substring(start, end).trim();
    
    options.push(optionText);
    console.log(`Extracted option ${idx + 2}: "${optionText.substring(0, 30)}..."`);
  });
  
  return options;
}

// Process a specific question
async function fixQuestion(questionId) {
  console.log(`\nFixing question ID ${questionId}`);
  
  // Get the existing options
  const { data: options, error } = await supabase
    .from('mcq_options')
    .select('*')
    .eq('question_id', questionId)
    .order('sequence_order');
    
  if (error) {
    console.error(`Error fetching options for question ${questionId}:`, error.message);
    return false;
  }
  
  console.log(`Found ${options?.length || 0} options for question ${questionId}`);
  
  if (!options || options.length === 0) {
    console.log(`No options found for question ${questionId}`);
    return false;
  }
  
  // Check if there's a combined option
  const combinedOption = options.find(opt => {
    return opt.option_text && (
      opt.option_text.includes(' b.') || 
      opt.option_text.includes(' c.') || 
      opt.option_text.includes(' d.')
    );
  });
  
  if (!combinedOption) {
    console.log(`No combined option found for question ${questionId}, skipping`);
    return false;
  }
  
  console.log(`Found combined option ${combinedOption.id}: ${combinedOption.option_text.substring(0, 50)}...`);
  
  // Parse the combined option
  const parsedOptions = parseOptions(combinedOption.option_text);
  
  if (parsedOptions.length <= 1) {
    console.log(`Could not parse options for question ${questionId}`);
    return false;
  }
  
  console.log(`Parsed ${parsedOptions.length} options from combined text`);
  
  // Update the first option in place
  const { error: updateError } = await supabase
    .from('mcq_options')
    .update({ option_text: parsedOptions[0] })
    .eq('id', combinedOption.id);
    
  if (updateError) {
    console.error(`Error updating option ${combinedOption.id}:`, updateError.message);
    return false;
  }
  
  console.log(`Updated option ${combinedOption.id} with text: ${parsedOptions[0]}`);
  
  // Insert the additional options
  const newOptions = parsedOptions.slice(1).map((text, idx) => ({
    question_id: questionId,
    option_text: text,
    sequence_order: combinedOption.sequence_order + idx + 1,
  }));
  
  if (newOptions.length > 0) {
    const { data: insertedOptions, error: insertError } = await supabase
      .from('mcq_options')
      .insert(newOptions)
      .select();
      
    if (insertError) {
      console.error(`Error inserting new options for question ${questionId}:`, insertError.message);
      return false;
    }
    
    console.log(`Successfully inserted ${insertedOptions.length} new options`);
    insertedOptions.forEach((opt, idx) => {
      console.log(`- Option ${idx + 2}: ${opt.option_text.substring(0, 50)}...`);
    });
  }
  
  return true;
}

// Main function
async function fixMCQOptions() {
  try {
    // Test connection
    console.log('Testing database connection...');
    const { data, error } = await supabase
      .from('mcq_options')
      .select('*')
      .limit(1);
      
    if (error) {
      console.error('Database connection test failed:', error.message);
      return;
    }
    
    console.log('Database connection successful');
    
    // Find the questions in Block 5 (parts where sequence_order=5)
    console.log('Looking for Block 5 questions...');
    const { data: block5Data, error: block5Error } = await supabase
      .from('questions')
      .select(`
        id, 
        question_text,
        block_id,
        blocks(
          id,
          part_id,
          parts(
            id,
            sequence_order
          )
        )
      `)
      .eq('blocks.parts.sequence_order', 5)
      .eq('question_type', 'multiple-choice');
      
    if (block5Error) {
      console.error('Error finding Block 5 questions:', block5Error.message);
      return;
    }
    
    console.log(`Found ${block5Data?.length || 0} questions in Block 5`);
    
    if (!block5Data || block5Data.length === 0) {
      console.log('No Block 5 questions found. Trying alternative query...');
      
      // Try a different approach to find Block 5 questions
      const { data: partsData } = await supabase
        .from('parts')
        .select('id')
        .eq('sequence_order', 5)
        .limit(1);
        
      if (partsData && partsData.length > 0) {
        const part5Id = partsData[0].id;
        console.log(`Found Part 5 with ID: ${part5Id}`);
        
        const { data: blocksData } = await supabase
          .from('blocks')
          .select('id')
          .eq('part_id', part5Id);
          
        if (blocksData && blocksData.length > 0) {
          console.log(`Found ${blocksData.length} blocks in Part 5`);
          const blockIds = blocksData.map(b => b.id);
          
          const { data: questionsData } = await supabase
            .from('questions')
            .select('id, question_text, question_type, block_id')
            .in('block_id', blockIds)
            .eq('question_type', 'multiple-choice');
            
          console.log(`Found ${questionsData?.length || 0} MCQ questions in Part 5 blocks`);
          
          if (questionsData && questionsData.length > 0) {
            block5Data = questionsData;
          }
        }
      }
    }
    
    if (!block5Data || block5Data.length === 0) {
      console.log('Could not find any Block 5 multiple-choice questions');
      return;
    }
    
    // Get all MCQ options that potentially contain combined options
    console.log('Searching for MCQ options with combined text...');
    const { data: mcqOptions, error: mcqError } = await supabase
      .from('mcq_options')
      .select('id, option_text, question_id, sequence_order')
      .in('question_id', block5Data.map(q => q.id))
      .or('option_text.ilike.% b. %,option_text.ilike.% c. %,option_text.ilike.% d. %');
      
    if (mcqError) {
      console.error('Error fetching MCQ options:', mcqError.message);
      return;
    }
    
    console.log(`Found ${mcqOptions?.length || 0} potential combined options in Block 5`);
    
    if (!mcqOptions || mcqOptions.length === 0) {
      console.log('No combined options found in Block 5');
      return;
    }
    
    // Get unique question IDs with combined options
    const questionIds = [...new Set(mcqOptions.map(opt => opt.question_id))];
    console.log(`Found ${questionIds.length} questions with combined options: ${questionIds.join(', ')}`);
    
    let successCount = 0;
    
    console.log(`Starting to fix ${questionIds.length} questions with combined options`);
    
    for (const questionId of questionIds) {
      const success = await fixQuestion(questionId);
      if (success) successCount++;
    }
    
    console.log(`\nCompleted fixing ${successCount} out of ${questionIds.length} questions`);
  } catch (error) {
    console.error('Unhandled error in fixMCQOptions:', error);
  }
}

// Run the script
console.log('Starting script to fix MCQ options...');
fixMCQOptions().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 