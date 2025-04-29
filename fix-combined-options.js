// Script to fix MCQ options that are combined with b., c., etc. markers
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// This function takes a string like "Option A b. Option B c. Option C" and splits it into individual options
function splitCombinedOptions(text) {
  if (!text) return [];
  
  // Find all occurrences of " b.", " c.", etc. to split the text
  const optionMarkers = [' b.', ' c.', ' d.', ' e.', ' f.'];
  const splitPositions = [];
  
  // Find the position of each marker in the text
  optionMarkers.forEach(marker => {
    const position = text.indexOf(marker);
    if (position !== -1) {
      splitPositions.push({ marker, position });
    }
  });
  
  // Sort split positions by their position in the text
  splitPositions.sort((a, b) => a.position - b.position);
  
  // Split the text at each marker position
  const options = [];
  let currentText = text;
  
  // If we found markers, split at each one
  if (splitPositions.length > 0) {
    // First option is everything before the first marker
    options.push({
      choice: 'a',
      text: currentText.substring(0, splitPositions[0].position).trim(),
      sequence_order: 1
    });
    
    // Process each marker and extract the text until the next marker
    splitPositions.forEach((split, index) => {
      const startPos = split.position + split.marker.length;
      const endPos = index < splitPositions.length - 1 ? splitPositions[index + 1].position : currentText.length;
      const optionText = currentText.substring(startPos, endPos).trim();
      
      options.push({
        choice: split.marker.trim().replace('.', ''), // Extract 'b', 'c', etc.
        text: optionText,
        sequence_order: index + 2 // +2 because we've already added the first option
      });
    });
    
    return options;
  }
  
  // If no markers found, return the entire text as one option
  return [{
    choice: 'a',
    text: text.trim(),
    sequence_order: 1
  }];
}

async function fixCombinedOptions() {
  try {
    console.log('Starting to fix combined MCQ options...');
    
    // Get questions with IDs from the screenshot (1719-1725)
    const questionIds = [1719, 1720, 1721, 1722, 1723, 1724, 1725];
    
    // For each question, get its options
    for (const questionId of questionIds) {
      console.log(`\nProcessing question ID ${questionId}`);
      
      const { data: options, error } = await supabase
        .from('mcq_options')
        .select('*')
        .eq('question_id', questionId)
        .order('sequence_order');
        
      if (error) {
        console.error(`Error fetching options for question ${questionId}:`, error.message);
        continue;
      }
      
      console.log(`Found ${options.length} options for question ${questionId}`);
      
      if (options.length === 0) {
        console.log(`No options found for question ${questionId}, skipping`);
        continue;
      }
      
      // Check if options need fixing (look for pattern with b., c., etc.)
      const optionToFix = options.find(opt => {
        const text = opt.option_text || '';
        return text.match(/ b\.| c\.| d\.| e\./);
      });
      
      if (!optionToFix) {
        console.log(`Question ${questionId} options don't need fixing, skipping`);
        continue;
      }
      
      console.log(`Found option that needs fixing: ${optionToFix.id}`);
      console.log(`Text: ${optionToFix.option_text.substring(0, 100)}...`);
      
      // Split the combined option text
      const splitOptions = splitCombinedOptions(optionToFix.option_text);
      
      if (splitOptions.length <= 1) {
        console.log('Failed to split options, skipping');
        continue;
      }
      
      console.log(`Split into ${splitOptions.length} separate options`);
      
      // Update the first option in place
      const { error: updateError } = await supabase
        .from('mcq_options')
        .update({ option_text: splitOptions[0].text })
        .eq('id', optionToFix.id);
        
      if (updateError) {
        console.error(`Error updating option ${optionToFix.id}:`, updateError.message);
        continue;
      }
      
      console.log(`Updated option ${optionToFix.id} with text: ${splitOptions[0].text}`);
      
      // Create the remaining options
      const newOptions = splitOptions.slice(1).map(opt => ({
        question_id: questionId,
        option_text: opt.text,
        sequence_order: optionToFix.sequence_order + opt.sequence_order
      }));
      
      const { data: insertedOptions, error: insertError } = await supabase
        .from('mcq_options')
        .insert(newOptions)
        .select('id, option_text');
        
      if (insertError) {
        console.error(`Error inserting new options for question ${questionId}:`, insertError.message);
        continue;
      }
      
      console.log(`Successfully inserted ${insertedOptions.length} new options`);
      insertedOptions.forEach((opt, idx) => {
        console.log(`- Option ${idx + 2}: ${opt.option_text.substring(0, 50)}...`);
      });
    }
    
    console.log('\nAll questions processed successfully!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the fix
fixCombinedOptions().catch(console.error); 