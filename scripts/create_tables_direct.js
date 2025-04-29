import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://mfeaktevlnqvyapgaqvw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mZWFrdGV2bG5xdnlhcGdhcXZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTQyMzQ4OCwiZXhwIjoyMDYwOTk5NDg4fQ.TA2pCLUbroauEFKSyvgysPB0wV38DoVvnKowWztoYW4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    // Read the SQL file contents
    const sqlFilePath = path.resolve(__dirname, '../supabase/migrations/20250423211858_create_initial_schema.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL into separate statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement one at a time
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Execute the SQL statement
      const { error } = await supabase.rpc('pg_execute', { sql: stmt + ';' });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        
        // Try alternative approach
        const { error: execError } = await supabase.rpc('execute_sql', { sql_string: stmt + ';' });
        if (execError) {
          console.error(`Alternative approach also failed:`, execError);
          
          // Check if tables already exist
          if (i === 0) {
            console.log('Checking if tables already exist...');
            const { data, error: listError } = await supabase.from('pg_tables')
              .select('schemaname, tablename')
              .eq('schemaname', 'public');
            
            if (listError) {
              console.error('Error checking tables:', listError);
            } else {
              console.log('Existing tables:', data);
            }
          }
          
          // If we're having issues with the first few statements, we might want to stop
          if (i < 3) {
            console.error('Stopping due to errors with initial statements.');
            break;
          }
        } else {
          console.log(`Alternative approach succeeded for statement ${i + 1}`);
        }
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('Done executing SQL statements');
    
    // Now try to verify the tables were created
    console.log('Checking for tables in the database...');
    await verifyTables();
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

async function verifyTables() {
  try {
    // Attempt direct SQL query
    const { data, error } = await supabase
      .from('pg_catalog.pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('Error checking tables:', error);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('Tables found in the database:');
      data.forEach(table => {
        console.log(`- ${table.tablename}`);
      });
    } else {
      console.log('No tables found in the public schema');
    }
  } catch (error) {
    console.error('Error verifying tables:', error);
  }
}

createTables(); 