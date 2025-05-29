// Simple migration runner for the competency mappings table
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
require('dotenv').config({ path: '.env.local' })

async function runMigration() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. Check your .env.local file.')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  try {
    console.log('🔄 Running competency mappings migration...')
    
    // Read the migration SQL
    const migrationSQL = fs.readFileSync('migrate_competency_mappings.sql', 'utf8')
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: migrationSQL 
    })

    if (error) {
      console.error('❌ Migration failed:', error)
      
      // Try alternative approach - execute statements one by one
      console.log('🔄 Trying alternative approach...')
      
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      for (const statement of statements) {
        if (statement.startsWith('--')) continue // Skip comments
        
        console.log(`Executing: ${statement.substring(0, 50)}...`)
        const { error: stmtError } = await supabase.rpc('exec_sql', { 
          sql: statement + ';' 
        })
        
        if (stmtError) {
          console.error(`❌ Failed to execute statement:`, stmtError)
          // Continue with other statements
        } else {
          console.log('✅ Statement executed successfully')
        }
      }
    } else {
      console.log('✅ Migration completed successfully!')
    }

  } catch (err) {
    console.error('❌ Migration error:', err)
    
    // Fallback: try creating the table directly
    console.log('🔄 Trying direct table creation...')
    
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS question_competency_mappings (
        id SERIAL PRIMARY KEY,
        question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
        competency_area VARCHAR(50) NOT NULL,
        mapped_by VARCHAR(255),
        mapped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_custom BOOLEAN DEFAULT TRUE,
        UNIQUE(question_id)
      );
    `
    
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createTableSQL 
    })
    
    if (createError) {
      console.error('❌ Direct table creation failed:', createError)
      console.log('\n📋 Manual SQL to run in Supabase SQL Editor:')
      console.log(migrationSQL)
    } else {
      console.log('✅ Table created successfully with direct approach!')
    }
  }
}

runMigration() 