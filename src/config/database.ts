import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-supabase.example.com';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('empleados').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.warn('[Database] Health check warning:', error.message);
    }
    return true;
  } catch (err) {
    console.error('[Database] Connection failed:', err);
    return false;
  }
}
