// Load environment variables
require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  try {
    // Try to select a record including the is_correct column
    const { data, error } = await supabase
      .from('mcq_options')
      .select('id, option_text, is_correct')
      .limit(1);

    if (error) {
      if (error.message.includes('column "is_correct" does not exist')) {
        console.log('❌ The is_correct column does not exist yet.');
        console.log('📝 Please run the migration first in your Supabase dashboard:');
        console.log('');
        console.log('ALTER TABLE mcq_options ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;');
        console.log('ALTER TABLE scenario_options ADD COLUMN is_correct BOOLEAN DEFAULT FALSE;');
        console.log('ALTER TABLE questions ADD COLUMN correct_answer TEXT;');
        console.log('');
        return false;
      } else {
        throw error;
      }
    }

    console.log('✅ Schema is ready! The is_correct column exists.');
    return true;
  } catch (error) {
    console.error('❌ Error checking schema:', error.message);
    return false;
  }
}

if (require.main === module) {
  checkSchema();
}

module.exports = checkSchema; 