import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // If rpc doesn't exist, we just instruct user. But let's try direct insert to see if the table exists.
  const { error } = await supabase.from('staff_invitations').select('*').limit(1);
  if (error && error.code === '42P01') {
    console.log("Table doesn't exist. Please run the SQL manually in Supabase.");
  } else {
    console.log("Table exists or other error:", error);
  }
}
run();
