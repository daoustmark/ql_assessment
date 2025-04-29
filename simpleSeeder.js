import { createClient } from '@supabase/supabase-js';

console.log('Starting simple seeder');

// Supabase connection
const supabaseUrl = 'https://mfeaktevlnqvyapgaqvw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZWFrdGV2bG5xdnlhcGdhcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQyMzQ4OCwiZXhwIjoyMDYwOTk5NDg4fQ.TA2pCLUbroauEFKSyvgysPB0wV38DoVvnKowWztoYW4';
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAssessment() {
  try {
    console.log('Creating assessment...');
    const { data, error } = await supabase
      .from('assessments')
      .insert([
        { 
          title: 'Business Valuation Assessment',
          description: 'Multi-part assessment on business valuation concepts and scenarios'
        }
      ])
      .select();

    if (error) {
      console.error('Error creating assessment:', error);
      return;
    }

    console.log('Assessment created:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

seedAssessment(); 