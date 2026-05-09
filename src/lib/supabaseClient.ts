import { createBrowserClient } from '@supabase/ssr';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
if (!supabaseUrl || !supabaseAnon) { throw new Error('Faltan variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY'); }
export const supabase = createBrowserClient(supabaseUrl, supabaseAnon);
