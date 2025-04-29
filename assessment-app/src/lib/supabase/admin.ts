import { createClient } from '@supabase/supabase-js';

// Ensure environment variables are loaded (e.g., using dotenv if running locally outside Next.js)
// import dotenv from 'dotenv';
// dotenv.config({ path: '../../.env.local' }); // Adjust path as needed

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Supabase URL not found. Make sure NEXT_PUBLIC_SUPABASE_URL is set.');
}
if (!serviceKey) {
  // Avoid throwing error during build time if key isn't needed yet
  // but log a warning for clarity, especially for seeding.
  console.warn('Supabase Service Role Key potentially missing. Ensure SUPABASE_SERVICE_ROLE_KEY is set for admin tasks like seeding.');
}

// Initialize Supabase admin client
// Note: Use this client ONLY in secure server-side environments (like seeding scripts or serverless functions)
// where the Service Role Key is not exposed to the browser.
export const supabaseAdmin = createClient(supabaseUrl, serviceKey || '', {
  auth: { autoRefreshToken: false, persistSession: false }
});

// Add a check to prevent accidental usage in client-side code
if (typeof window !== 'undefined') {
  // console.warn('Supabase admin client initialized on the client-side. This is insecure and should not happen.');
  // Potentially throw an error or return a dummy client in production builds
} 