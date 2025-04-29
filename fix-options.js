// Script to fix MCQ options
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'available' : 'missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? 'available' : 'missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

console.log('Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Function to split combined options text
function splitOptions(text) {
  if (!text) return [];
  
  console.log('Analyzing text:', text.substring(0, 50) + '...');
  
  // Look for patterns like "text b. more text c. even more text"
  const markers = [' b.', ' c.', ' d.', ' e.'];
  const splitPoints = [];
  
  // Find positions of option markers
  markers.forEach(marker => {
    const pos = text.indexOf(marker);
    if (pos !== -1) {
      splitPoints.push({ marker, position: pos });
      console.log(`Found marker "${marker}" at position ${pos}`);
    }
  });
  
  // If no markers found, return original text as single option
  if (splitPoints.length === 0) {
    console.log('No option markers found in text.');
    return [{ text: text.trim(), order: 1 }];
  }
  
  // Sort split points by position
  splitPoints.sort((a, b) => a.position - b.position);
  
  // Split the text into separate options
  const options = [];
  
  // First option is everything before first marker
  const firstOptionText = text.substring(0, splitPoints[0].position).trim();
  options.push({
    text: firstOptionText,
    order: 1
  });
  console.log(`Created option 1: "${firstOptionText.substring(0, 30)}..."`);
  
  // Process each split point
  splitPoints.forEach((point, index) => {
    const start = point.position + point.marker.length;
    const end = index < splitPoints.length - 1 ? 
                splitPoints[index + 1].position : 
                text.length;
    
    const optionText = text.substring(start, end).trim();
    options.push({
      text: optionText,
      order: index + 2 // +2 because first option is order 1
    });
    console.log(`Created option ${index + 2}: "${optionText.substring(0, 30)}..."`);
  });
  
  return options;
}

// Test function to verify database connection
async function testConnection() {
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabase
      .from('mcq_options')
      .select('count(*)')
      .limit(1);
      
    if (error) {
      console.error('Connection test failed:', error.message);
      return false;
    }
    
    console.log('Connection test successful:', data);
    return true;
  } catch (error) {
    console.error('Connection test error:', error.message);
    return false;
  }
}

// Function to get question details
async function getQuestionDetails(questionId) {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('question_text, question_type')
      .eq('id', questionId)
      .single();
      
    if (error) {
      console.error(`Error fetching question ${questionId}:`, error.message);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Error in getQuestionDetails for ${questionId}:`, error.message);
    return null;
  }
}

// Main function to process and fix options
async function fixMCQOptions() {
  try {
    // Test connection first
    const connectionOk = await testConnection();
    if (!connectionOk) {
      console.error('Database connection failed, exiting.');
      return;
    }
    
    // Define the question IDs to process (from screenshot)
    const questionIds = [1719, 1720, 1721, 1722, 1723, 1724, 1725];
    
    for (const questionId of questionIds) {
      console.log(`\n================================================================`);
      console.log(`Processing question ID ${questionId}...`);
      
      // Get question details
      const questionDetails = await getQuestionDetails(questionId);
      if (questionDetails) {
        console.log(`Question text: ${questionDetails.question_text.substring(0, 100)}...`);
        console.log(`Question type: ${questionDetails.question_type}`);
      }
      
      // Get the current options for this question
      const { data: options, error } = await supabase
        .from('mcq_options')
        .select('*')
        .eq('question_id', questionId)
        .order('sequence_order');
      
      if (error) {
        console.error(`Error fetching options for question ${questionId}:`, error.message);
        continue;
      }
      
      if (!options || options.length === 0) {
        console.log(`No options found for question ${questionId}`);
        continue;
      }
      
      console.log(`Found ${options.length} options:`);
      options.forEach(opt => {
        console.log(`- ID ${opt.id}, Seq ${opt.sequence_order}: ${opt.option_text?.substring(0, 50)}...`);
      });
      
      // Find option that might contain combined text
      const combinedOption = options.find(opt => 
        opt.option_text && (
          opt.option_text.includes(' b.') || 
          opt.option_text.includes(' c.') ||
          opt.option_text.includes(' d.')
        )
      );
      
      if (!combinedOption) {
        console.log(`No combined options found for question ${questionId}`);
        continue;
      }
      
      console.log(`Found combined option: ${combinedOption.id}`);
      console.log(`Text: ${combinedOption.option_text}`);
      
      // Split the combined option text
      const splitOptionsList = splitOptions(combinedOption.option_text);
      
      if (splitOptionsList.length <= 1) {
        console.log(`Could not split option for question ${questionId}`);
        continue;
      }
      
      console.log(`Split into ${splitOptionsList.length} separate options`);
      
      // Update the first option
      const { error: updateError } = await supabase
        .from('mcq_options')
        .update({ option_text: splitOptionsList[0].text })
        .eq('id', combinedOption.id);
      
      if (updateError) {
        console.error(`Error updating option ${combinedOption.id}:`, updateError.message);
        continue;
      }
      
      console.log(`Updated first option (${combinedOption.id}) with text: ${splitOptionsList[0].text}`);
      
      // Insert the additional options
      const newOptions = splitOptionsList.slice(1).map(opt => ({
        question_id: questionId,
        option_text: opt.text,
        sequence_order: combinedOption.sequence_order + opt.order - 1
      }));
      
      if (newOptions.length > 0) {
        const { data: insertedOptions, error: insertError } = await supabase
          .from('mcq_options')
          .insert(newOptions)
          .select();
        
        if (insertError) {
          console.error(`Error inserting new options for question ${questionId}:`, insertError.message);
          continue;
        }
        
        console.log(`Successfully inserted ${insertedOptions.length} new options:`);
        insertedOptions.forEach(opt => {
          console.log(`- ID ${opt.id}: ${opt.option_text}`);
        });
      }
    }
    
    console.log('\nProcess completed!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the script
console.log('Starting script to fix MCQ options...');
fixMCQOptions().catch(err => console.error('Unhandled error:', err)); 