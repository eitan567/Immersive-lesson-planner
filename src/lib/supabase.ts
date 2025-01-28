import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aaxajecvlxekgknbfqwh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheGFqZWN2bHhla2drbmJmcXdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzgwNzExMjgsImV4cCI6MjA1MzY0NzEyOH0.ztoOW4fKYirHuKJ7XkAIWrRN2kLAJd1S02gfKb0RUCI';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];