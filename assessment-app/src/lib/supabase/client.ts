import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  // Note: RLS policies should handle security on the client-side
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
} 