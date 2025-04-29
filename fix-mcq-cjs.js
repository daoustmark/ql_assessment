// Script to fix specific MCQ options in the database based on screenshot (IDs 1719-1725)
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

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
  const markers = [' b.', ' c.', ' d.', ' e.'];
  let positions = [];
  
  // Find all marker positions
  markers.forEach(marker => {
    const pos = text.indexOf(marker);
    if (pos !== -1) {
      positions.push({ marker, position: pos });
    }
  });
  
  // If no markers found, return original text
  if (positions.length === 0) {
    return [text];
  }
  
  // Sort positions
  positions.sort((a, b) => a.position - b.position);
  
  // Extract options
  const options = [];
  
  // First option is everything before first marker
  options.push(text.substring(0, positions[0].position).trim());
  
  // Process remaining options
  positions.forEach((pos, idx) => {
    const start = pos.position + pos.marker.length;
    const end = idx < positions.length - 1 ? positions[idx + 1].position : text.length;
    options.push(text.substring(start, end).trim());
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
  // Questions to fix from screenshot
  const questionIds = [1719, 1720, 1721, 1722, 1723, 1724, 1725];
  let successCount = 0;
  
  console.log(`Starting to fix ${questionIds.length} questions with combined options`);
  
  for (const questionId of questionIds) {
    const success = await fixQuestion(questionId);
    if (success) successCount++;
  }
  
  console.log(`\nCompleted fixing ${successCount} out of ${questionIds.length} questions`);
}

// Run the script
console.log('Starting script to fix MCQ options...');
fixMCQOptions().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 