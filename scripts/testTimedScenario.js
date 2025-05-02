const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function testTimedScenario() {
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Check your .env.local file.');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log("=== TESTING TIMED SCENARIO COMPONENTS ===\n");
    
    // 1. Check if Block 73 exists
    console.log("1. Checking Block 73...");
    const { data: block, error: blockError } = await supabase
      .from('blocks')
      .select('*')
      .eq('id', 73)
      .single();
      
    if (blockError) {
      console.error('❌ Error fetching block:', blockError.message);
      return;
    }
    
    console.log(`✓ Block 73 exists: "${block.title}"`);
    console.log(`  Description: "${block.description}"`);
    console.log(`  Type: ${block.block_type}`);
    
    // 2. Check if Block 73 has a scenario
    console.log("\n2. Checking for scenarios...");
    const { data: scenarios, error: scenariosError } = await supabase
      .from('scenarios')
      .select('*')
      .eq('block_id', 73);
      
    if (scenariosError) {
      console.error('❌ Error fetching scenarios:', scenariosError.message);
    } else if (!scenarios || scenarios.length === 0) {
      console.log('❌ No scenarios found for Block 73');
    } else {
      console.log(`✓ Found ${scenarios.length} scenario(s):`);
      scenarios.forEach(s => {
        console.log(`  Scenario ${s.id}: "${s.scenario_text.substring(0, 50)}..."`);
      });
    }
    
    // 3. Check if Block 73 has a textarea question
    console.log("\n3. Checking for textarea questions...");
    const { data: textareaQuestions, error: textareaError } = await supabase
      .from('questions')
      .select('*')
      .eq('block_id', 73)
      .eq('question_type', 'textarea');
      
    if (textareaError) {
      console.error('❌ Error fetching textarea questions:', textareaError.message);
    } else if (!textareaQuestions || textareaQuestions.length === 0) {
      console.log('❌ No textarea questions found for Block 73');
      
      // Check if there are any questions at all for this block
      const { data: allQuestions, error: allQuestionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('block_id', 73);
        
      if (!allQuestionsError && allQuestions && allQuestions.length > 0) {
        console.log(`  Found ${allQuestions.length} total questions of other types:`);
        allQuestions.forEach(q => {
          console.log(`  Question ${q.id}: Type=${q.question_type}, "${q.question_text?.substring(0, 50)}..."`);
        });
      }
    } else {
      console.log(`✓ Found ${textareaQuestions.length} textarea question(s):`);
      textareaQuestions.forEach(q => {
        console.log(`  Question ${q.id}: "${q.question_text?.substring(0, 50)}..."`);
      });
    }
    
    console.log("\n=== TEST SUMMARY ===");
    console.log("Block: " + (block ? "✓" : "❌"));
    console.log("Scenario: " + (scenarios && scenarios.length > 0 ? "✓" : "❌"));
    console.log("Textarea Question: " + (textareaQuestions && textareaQuestions.length > 0 ? "✓" : "❌"));
    
    console.log("\nIf any component is missing, our fixes should handle it by:");
    console.log("1. Creating a placeholder scenario if none exists");
    console.log("2. Finding the textarea question, or falling back to any available question");
    console.log("3. Using the WYSIWYG editor for timed responses regardless of option availability");
    
  } catch (error) {
    console.error('Error testing timed scenario:', error);
  }
}

testTimedScenario().catch(console.error); 