import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

// --- Supabase Admin Client Setup ---
// Read environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase;
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or Service Role Key is missing. Using hardcoded development credentials.');
  
  // Fallback for development only - remove in production
  const devSupabaseUrl = 'https://mfeaktevlnqvyapgaqvw.supabase.co';
  const devServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZWFrdGV2bG5xdnlhcGdhcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQyMzQ4OCwiZXhwIjoyMDYwOTk5NDg4fQ.TA2pCLUbroauEFKSyvgysPB0wV38DoVvnKowWztoYW4';
  
  supabase = createClient(devSupabaseUrl, devServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
} else {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

console.log('Supabase client created');

async function enableRLS() {
  try {
    console.log('Checking RLS status...');
    
    // Check if RLS is enabled
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('execute_sql', { 
        sql_query: "SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'assessment_attempts';" 
      });
    
    if (rlsError) {
      throw new Error(`Failed to check RLS status: ${rlsError.message}`);
    }
    
    console.log('Current RLS status:', rlsStatus);
    
    if (rlsStatus && rlsStatus.length > 0) {
      const isEnabled = rlsStatus[0].relrowsecurity;
      
      if (!isEnabled) {
        console.log('RLS is NOT enabled on assessment_attempts table. Enabling it now...');
        
        // Enable RLS
        const { error: enableError } = await supabase
          .rpc('execute_sql', { 
            sql_query: "ALTER TABLE assessment_attempts ENABLE ROW LEVEL SECURITY;" 
          });
        
        if (enableError) {
          throw new Error(`Failed to enable RLS: ${enableError.message}`);
        }
        
        console.log('RLS has been enabled successfully.');
      } else {
        console.log('RLS is already enabled on assessment_attempts table.');
      }
    } else {
      console.log('Could not find assessment_attempts table.');
    }
    
    // Check existing policies
    console.log('\nChecking existing RLS policies...');
    
    const { data: policies, error: policyError } = await supabase
      .rpc('execute_sql', { 
        sql_query: "SELECT * FROM pg_policies WHERE tablename = 'assessment_attempts';" 
      });
    
    if (policyError) {
      throw new Error(`Failed to check policies: ${policyError.message}`);
    }
    
    console.log('Current policies:', policies);
    
    // Create required policies if they don't exist
    if (!policies || policies.length === 0) {
      console.log('\nNo policies found. Creating required policies...');
      
      const createPolicies = [
        "CREATE POLICY \"Users can view own attempts\" ON assessment_attempts FOR SELECT USING (user_id = auth.uid());",
        "CREATE POLICY \"Users can insert own attempts\" ON assessment_attempts FOR INSERT WITH CHECK (user_id = auth.uid());",
        "CREATE POLICY \"Users can update own attempts\" ON assessment_attempts FOR UPDATE USING (user_id = auth.uid());"
      ];
      
      for (const policy of createPolicies) {
        const { error } = await supabase.rpc('execute_sql', { sql_query: policy });
        
        if (error) {
          console.error(`Error creating policy: ${error.message}`);
        } else {
          console.log(`Successfully created policy: ${policy}`);
        }
      }
    } else {
      console.log(`Found ${policies.length} existing policies.`);
    }
    
    console.log('\nRLS setup complete. Your table should now be secure with proper access policies.');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

enableRLS(); 