/**
 * Supabase client singleton for use in shared package and apps.
 *
 * Usage:
 *   import { createSupabaseClient } from '@mugen/shared';
 *
 * Each app will call this factory with its own env vars. Do NOT import
 * SUPABASE_URL or SUPABASE_ANON_KEY here — pass them as arguments to
 * keep this package env-agnostic.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export type TypedSupabaseClient = SupabaseClient<Database>;

let _client: TypedSupabaseClient | null = null;

/**
 * Returns a typed Supabase client singleton.
 * Call once at app startup with your env vars.
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
): TypedSupabaseClient {
  if (!_client) {
    _client = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}

/**
 * Returns the existing client instance (throws if not yet initialized).
 */
export function getSupabaseClient(): TypedSupabaseClient {
  if (!_client) {
    throw new Error(
      '[MugenDojo] Supabase client not initialized. Call createSupabaseClient() first.',
    );
  }
  return _client;
}
