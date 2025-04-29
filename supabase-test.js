console.log('Testing Supabase connection...');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl);
console.log('Key available:', !!supabaseKey);

// Initialize Supabase client
if (supabaseUrl && supabaseKey) {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  
  console.log('Supabase client created');
  
  // Test connection with a simple query
  async function testConnection() {
    try {
      console.log('Running test query...');
      const { data, error } = await supabase
        .from('mcq_options')
        .select('count(*)')
        .limit(1);
        
      if (error) {
        console.error('Query error:', error.message);
      } else {
        console.log('Query successful:', data);
      }
    } catch (err) {
      console.error('Connection error:', err.message);
    }
  }
  
  testConnection();
} else {
  console.error('Missing Supabase credentials');
} 