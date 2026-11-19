import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://mwrqipqbkbgxujywnucc.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_PUyZSmJbc0JAb9evmoy9rg_ih2IDsmA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
