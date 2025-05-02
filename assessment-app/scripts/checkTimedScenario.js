const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function checkTimedScenario() {
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Check your .env.local file.');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Get the block with ID 73 (Time Negotiation Lightning Round)
  const { data: block, error: blockError } = await supabase
    .from('blocks')
    .select('*')
    .eq('id', 73)
    .single();
    
  if (blockError) {
    console.error('Error fetching block:', blockError.message);
    return;
  }
  
  console.log('Block data:', block);
  
  // Get questions associated with this block
  const { data: questions, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('block_id', 73);
    
  if (questionsError) {
    console.error('Error fetching questions:', questionsError.message);
  } else {
    console.log(`Found ${questions.length} questions for block 73:`);
    questions.forEach(q => {
      console.log(`  Question ${q.id}: ${q.question_type} - ${q.question_text}`);
    });
  }
  
  // Get scenarios associated with this block
  const { data: scenarios, error: scenariosError } = await supabase
    .from('scenarios')
    .select('*')
    .eq('block_id', 73);
    
  if (scenariosError) {
    console.error('Error fetching scenarios:', scenariosError.message);
  } else {
    console.log(`Found ${scenarios.length} scenarios for block 73:`);
    scenarios.forEach(s => {
      console.log(`  Scenario ${s.id}: ${s.scenario_text.substring(0, 100)}...`);
    });
  }
  
  // Check for any questions with 'textarea' type for this block
  const { data: textareaQuestions, error: textareaError } = await supabase
    .from('questions')
    .select('*')
    .eq('block_id', 73)
    .eq('question_type', 'textarea');
    
  if (textareaError) {
    console.error('Error fetching textarea questions:', textareaError.message);
  } else {
    console.log(`Found ${textareaQuestions.length} textarea questions for block 73:`);
    textareaQuestions.forEach(q => {
      console.log(`  Question ${q.id}: ${q.question_text}`);
    });
  }
  
  // Check if we have any questions at all with textarea type
  const { data: allTextareaQuestions, error: allTextareaError } = await supabase
    .from('questions')
    .select('*')
    .eq('question_type', 'textarea');
    
  if (allTextareaError) {
    console.error('Error fetching all textarea questions:', allTextareaError.message);
  } else {
    console.log(`Found ${allTextareaQuestions.length} textarea questions in the entire database`);
  }
}

checkTimedScenario().catch(console.error); 