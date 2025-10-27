import { createClient } from '@supabase/supabase-js';

// Създава клиента за използване в Server Components / Server Actions
export const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
