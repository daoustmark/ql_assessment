// Script to diagnose and fix Part 5 scenario issues
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixPart5() {
  try {
    console.log('Checking Part 5 data...');
    
    // 1. Fetch Part 5
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
    
    // 2. Check blocks in Part 5
    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('id, title, description, block_type, sequence_order')
      .eq('part_id', part5.id)
      .order('sequence_order');
      
    if (blocksError) {
      console.error('Error fetching blocks:', blocksError.message);
      return;
    }
    
    if (!blocks || blocks.length === 0) {
      console.log('No blocks found in Part 5. Creating default block...');
      
      // Create a default scenario_group block
      const { data: newBlock, error: newBlockError } = await supabase
        .from('blocks')
        .insert({
          part_id: part5.id,
          title: 'Ethical Dilemmas',
          description: 'Respond to these ethical dilemmas',
          block_type: 'scenario_group',
          sequence_order: 1
        })
        .select()
        .single();
        
      if (newBlockError) {
        console.error('Error creating default block:', newBlockError.message);
        return;
      }
      
      console.log('Created new block:', newBlock);
      
      // Continue with the newly created block
      blocks = [newBlock];
    } else {
      console.log(`Found ${blocks.length} blocks in Part 5:`, blocks);
    }
    
    // 3. Check each block for scenarios and questions
    for (const block of blocks) {
      // Check for scenarios
      const { data: scenarios, error: scenariosError } = await supabase
        .from('scenarios')
        .select('id, scenario_text, sequence_order')
        .eq('block_id', block.id)
        .order('sequence_order');
        
      if (scenariosError) {
        console.error(`Error fetching scenarios for block ${block.id}:`, scenariosError.message);
        continue;
      }
      
      console.log(`Block ${block.id} has ${scenarios.length} scenarios`);
      
      if (scenarios.length === 0 && block.block_type.includes('scenario')) {
        console.log(`WARNING: Block ${block.id} is a scenario block but has no scenarios!`);
      }
      
      // 4. Check for questions
      const { data: questions, error: questionsError } = await supabase
        .from('questions')
        .select('id, question_text, question_type, sequence_order')
        .eq('block_id', block.id)
        .order('sequence_order');
        
      if (questionsError) {
        console.error(`Error fetching questions for block ${block.id}:`, questionsError.message);
        continue;
      }
      
      console.log(`Block ${block.id} has ${questions.length} questions`);
      
      // 5. Display any issues found
      const issues = [];
      
      if (block.block_type === 'scenario_group' && scenarios.length === 0) {
        issues.push(`Block ${block.id} is a scenario_group but has no scenarios`);
      }
      
      if (block.block_type === 'scenario_group' && questions.length === 0) {
        issues.push(`Block ${block.id} is a scenario_group but has no questions`);
      }
      
      // Check each scenario for options
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
        
        if (options.length === 0) {
          issues.push(`Scenario ${scenario.id} has no options`);
        }
      }
      
      if (issues.length > 0) {
        console.log(`Issues found in block ${block.id}:`, issues);
      } else {
        console.log(`No issues found in block ${block.id}`);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkAndFixPart5().catch(console.error); 