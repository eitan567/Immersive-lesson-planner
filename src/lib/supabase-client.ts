/// <reference lib="dom" />
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types.ts';

// Supabase client initialization
const supabaseUrl = 'https://aaxajecvlxekgknbfqwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheGFqZWN2bHhla2drbmJmcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzExMjgsImV4cCI6MjA1MzY0NzEyOH0.ztoOW4fKYirHuKJ7XkAIWrRN2kLAJd1S02gfKb0RUCI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Type helpers
export type DbResult<T> = T extends PromiseLike<infer U> ? U : never;
export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never;

// Error handling
export class SupabaseError extends Error {
  constructor(message: string, public details: unknown = null) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export const handleError = (error: Error): never => {
  console.error('Supabase operation failed:', error);
  throw new SupabaseError(
    'Operation failed',
    error instanceof Error ? error.message : 'Unknown error'
  );
};

/**
 * Type-safe database query wrapper
 * @param operation - Function that performs the database operation
 * @returns Result of the operation
 */
export async function dbOperation<T>(
  operation: (client: SupabaseClient<Database>) => Promise<T>
): Promise<T> {
  try {
    return await operation(supabase);
  } catch (error) {
    return handleError(error as Error);
  }
}

// Export user type
export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];