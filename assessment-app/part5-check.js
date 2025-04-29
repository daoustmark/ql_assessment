// Simple script to check Part 5
console.log('Script starting...');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('Supabase URL:', supabaseUrl);
console.log('Key available:', cat part5-check.js && node part5-check.jssupabaseKey);
