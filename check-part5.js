// Simple script to check Part 5
console.log('Script starting...');

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// These log statements will show if the environment variables are being loaded correctly
console.log('Checking environment variables...');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'set' : 'not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 5) + '...' + supabaseKey.substring(supabaseKey.length - 5));

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkPart5() {
  try {
    console.log('Checking Part 5...');
    
    // Check if we can access the database at all
    console.log('Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('parts')
      .select('count(*)')
      .limit(1);
      
    if (testError) {
      console.error('Database connection error:', testError.message);
      return;
    }
    
    console.log('Database connection successful:', testData);
    
    // Get Part 5
    const { data: part, error } = await supabase
      .from('parts')
      .select('*')
      .eq('sequence_order', 5)
      .single();
    
    if (error) {
      console.error('Error fetching Part 5:', error.message);
      return;
    }
    
    console.log('Part 5 found:', part);
    
    // Get blocks in Part 5
    const { data: blocks, error: blocksError } = await supabase
      .from('blocks')
      .select('*')
      .eq('part_id', part.id);
      
    if (blocksError) {
      console.error('Error fetching blocks for Part 5:', blocksError.message);
      return;
    }
    
    console.log(`Found ${blocks.length} blocks for Part 5:`, blocks);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

console.log('Calling checkPart5()...');
checkPart5().catch(err => console.error('Unhandled error:', err)); 