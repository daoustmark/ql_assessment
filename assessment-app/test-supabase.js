console.log('Testing Supabase connection...');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('URL:', supabaseUrl, 'Key available:', node test-supabase.jssupabaseKey);
