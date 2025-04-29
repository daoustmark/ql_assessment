import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkPolicies() {
  try {
    // Direct SQL query to check RLS status
    const { data: rlsData, error: rlsError } = await supabase
      .rpc('execute_sql', { 
        sql_query: "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'assessment_attempts';" 
      });
    
    if (rlsError) {
      console.error('Error checking RLS status:', rlsError);
    } else {
      console.log('RLS Status for assessment_attempts:', rlsData);
    }
    
    // Check RLS policies
    const { data: policiesData, error: policiesError } = await supabase
      .rpc('execute_sql', { 
        sql_query: "SELECT * FROM pg_policies WHERE tablename = 'assessment_attempts';" 
      });
    
    if (policiesError) {
      console.error('Error fetching policies:', policiesError);
    } else {
      console.log('\nRLS Policies for assessment_attempts:');
      console.log(JSON.stringify(policiesData, null, 2));
    }
    
    // Check the table definition
    const { data: tableData, error: tableError } = await supabase
      .rpc('execute_sql', { 
        sql_query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'assessment_attempts';" 
      });
    
    if (tableError) {
      console.error('Error fetching table definition:', tableError);
    } else {
      console.log('\nTable Definition:');
      console.log(JSON.stringify(tableData, null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPolicies(); 