import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@mugen/shared';

/**
 * Creates a Supabase client for use in Client Components.
 * Singleton pattern — safe to call multiple times.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
