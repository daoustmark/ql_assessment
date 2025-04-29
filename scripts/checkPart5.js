// Script to check Part 5 scenarios
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkPart5() {
  // Create Supabase client using environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check if part 5 exists
    console.log('Checking Part 5...');
    const { data: part5, error: part5Error } = await supabase
      .from('parts')
      .select('id, title, description, sequence_order')
      .eq('sequence_order', 5)
      .single();

    if (part5Error) {
      console.error('Error fetching Part 5:', part5Error.message);
      return;
    }

    console.log('Part 5 found:', part5);

    // Check blocks in part 5
    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('id, title, description, block_type, sequence_order')
      .eq('part_id', part5.id)
      .order('sequence_order');

    if (blocksError) {
      console.error('Error fetching blocks for Part 5:', blocksError.message);
      return;
    }

    console.log('Blocks in Part 5:', blocks);

    // Check each block for scenarios
    for (const block of blocks) {
      console.log(`\nChecking scenarios in block ${block.id} (${block.title}):`);
      
      const { data: scenarios, error: scenariosError } = await supabase
        .from('scenarios')
        .select('id, scenario_text, sequence_order')
        .eq('block_id', block.id)
        .order('sequence_order');

      if (scenariosError) {
        console.error(`Error fetching scenarios for block ${block.id}:`, scenariosError.message);
        continue;
      }

      console.log(`Found ${scenarios.length} scenarios in block ${block.id}:`);
      scenarios.forEach(scenario => {
        console.log(`  Scenario ${scenario.id} (sequence ${scenario.sequence_order})`);
        // Check if the scenario text is properly formed
        if (!scenario.scenario_text || scenario.scenario_text.trim().length === 0) {
          console.error(`  WARNING: Scenario ${scenario.id} has empty or null scenario_text!`);
        }
      });

      // Check for scenario options for each scenario
      for (const scenario of scenarios) {
        const { data: options, error: optionsError } = await supabase
          .from('scenario_options')
          .select('id, option_text, sequence_order')
          .eq('scenario_id', scenario.id)
          .order('sequence_order');

        if (optionsError) {
          console.error(`Error fetching options for scenario ${scenario.id}:`, optionsError.message);
          continue;
        }

        console.log(`  Scenario ${scenario.id} has ${options.length} options`);
        if (options.length === 0) {
          console.error(`  WARNING: Scenario ${scenario.id} has no options!`);
        }
      }
      
      // Check for questions in this block
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, question_text, question_type, sequence_order')
        .eq('block_id', block.id)
        .order('sequence_order');

      if (questionsError) {
        console.error(`Error fetching questions for block ${block.id}:`, questionsError.message);
        continue;
      }

      console.log(`Found ${questions.length} questions in block ${block.id}:`);
      questions.forEach(question => {
        console.log(`  Question ${question.id} (type: ${question.question_type}, sequence ${question.sequence_order})`);
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkPart5().catch(console.error); 