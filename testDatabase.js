import { createClient } from '@supabase/supabase-js';

console.log('Script started');

// Supabase connection
const supabaseUrl = 'https://mfeaktevlnqvyapgaqvw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZWFrdGV2bG5xdnlhcGdhcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQyMzQ4OCwiZXhwIjoyMDYwOTk5NDg4fQ.TA2pCLUbroauEFKSyvgysPB0wV38DoVvnKowWztoYW4';
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase client created');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    const { data, error } = await supabase.from('assessments').select('*');
    
    if (error) {
      console.error('Error accessing database:', error);
      return;
    }
    
    console.log('Database connection successful!');
    console.log('Existing assessments:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testDatabase(); 