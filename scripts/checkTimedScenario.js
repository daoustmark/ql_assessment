import { createClient } from '@supabase/supabase-js';

// Use the same credentials as in check_db.mjs
const supabaseUrl = 'https://mfeaktevlnqvyapgaqvw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZWFrdGV2bG5xdnlhcGdhcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQyMzQ4OCwiZXhwIjoyMDYwOTk5NDg4fQ.TA2pCLUbroauEFKSyvgysPB0wV38DoVvnKowWztoYW4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTimedScenario() {
  try {
    console.log("Checking for timed scenario blocks...");
    
    // Find all blocks that have "Timed" in the description
    const { data: timedBlocks, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .ilike('description', '%Timed%')
      .order('id');
    
    if (blocksError) throw blocksError;
    
    console.log(`Found ${timedBlocks.length} blocks with "Timed" in the description.`);
    
    // Specifically target block ID 73 mentioned in error logs
    const blockOfInterest = timedBlocks.find(block => block.id === 73) || timedBlocks[0];
    
    if (!blockOfInterest) {
      console.log("No timed blocks found or block ID 73 doesn't exist.");
      return;
    }
    
    console.log("\n==== BLOCK DETAILS ====");
    console.log(`Block ID: ${blockOfInterest.id}`);
    console.log(`Title: ${blockOfInterest.title}`);
    console.log(`Description: ${blockOfInterest.description}`);
    console.log(`Type: ${blockOfInterest.block_type}`);
    
    // Fetch scenarios for this block
    const { data: scenarios, error: scenariosError } = await supabase
      .from('scenarios')
      .select('*, scenario_options(*)')
      .eq('block_id', blockOfInterest.id)
      .order('sequence_order');
    
    if (scenariosError) throw scenariosError;
    
    console.log(`\n==== SCENARIOS (${scenarios.length}) ====`);
    scenarios.forEach(scenario => {
      console.log(`Scenario ID: ${scenario.id}`);
      console.log(`Text: ${scenario.scenario_text.substring(0, 100)}...`);
      console.log(`Options: ${scenario.scenario_options ? scenario.scenario_options.length : 0}`);
      if (scenario.scenario_options && scenario.scenario_options.length > 0) {
        scenario.scenario_options.forEach(option => {
          console.log(`  - Option ID ${option.id}: ${option.option_text.substring(0, 50)}...`);
        });
      }
      console.log('-----');
    });
    
    // Fetch questions for this block
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*, mcq_options(*)')
      .eq('block_id', blockOfInterest.id)
      .order('sequence_order');
    
    if (questionsError) throw questionsError;
    
    console.log(`\n==== QUESTIONS (${questions.length}) ====`);
    questions.forEach(question => {
      console.log(`Question ID: ${question.id}`);
      console.log(`Type: ${question.question_type}`);
      console.log(`Text: ${question.question_text ? question.question_text.substring(0, 100) : 'No text'}...`);
      console.log(`Required: ${question.is_required}`);
      if (question.mcq_options && question.mcq_options.length > 0) {
        console.log(`Options: ${question.mcq_options.length}`);
        question.mcq_options.forEach(option => {
          console.log(`  - Option ID ${option.id}: ${option.option_text.substring(0, 50)}...`);
        });
      }
      console.log('-----');
    });
    
  } catch (error) {
    console.error('Error checking timed scenarios:', error);
  }
}

checkTimedScenario(); 