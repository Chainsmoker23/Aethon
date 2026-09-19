import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.rpc('exec_sql', { sql: `SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'user_profiles_role_check';` });
  console.log(data || error);
}
check();
