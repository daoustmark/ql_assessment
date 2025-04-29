import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      
      // Execute the SQL statement directly
      try {
        // Try a direct REST API call to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({
            query: stmt
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Error with statement ${i + 1}:`, errorData);
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (sqlError) {
        console.error(`Error executing statement ${i + 1}:`, sqlError);
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
    // Use direct SQL query via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        query: "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'"
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error checking tables:', errorData);
      return;
    }
    
    const data = await response.json();
    
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