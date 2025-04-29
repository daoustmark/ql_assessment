import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mfeaktevlnqvyapgaqvw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZWFrdGV2bG5xdnlhcGdhcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQyMzQ4OCwiZXhwIjoyMDYwOTk5NDg4fQ.TA2pCLUbroauEFKSyvgysPB0wV38DoVvnKowWztoYW4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    // Use raw SQL to query for tables in the public schema
    const { data, error } = await supabase.rpc('get_tables');
    
    if (error) {
      // If the RPC doesn't exist, fall back to a raw query
      console.log('RPC failed, trying direct SQL query...');
      const { data: sqlData, error: sqlError } = await supabase
        .from('_rpc')
        .select('*')
        .rpc('select_tables');
      
      if (sqlError) throw sqlError;
      console.log('Tables in database:', sqlData);
    } else {
      console.log('Tables in database:', data);
    }
  } catch (error) {
    console.error('Error checking database, trying another approach');
    
    try {
      // Try a direct SQL query approach
      const { data, error } = await supabase
        .rpc('query', { query_text: 'SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = \'public\'' });
      
      if (error) throw error;
      
      console.log('Tables in public schema:');
      if (data.length === 0) {
        console.log('No tables found in the public schema.');
      } else {
        data.forEach(row => {
          console.log(`- ${row.tablename}`);
        });
      }
    } catch (finalError) {
      console.error('Final error checking database:', finalError);
    }
  }
}

checkDatabase(); 