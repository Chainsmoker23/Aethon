import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load directly without dotenvx
config({ path: '.env.local' });

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing keys!");
  process.exit(1);
}

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: invites, error: e1 } = await supabaseAdmin.from('staff_invitations').select('*');
  console.log("INVITATIONS:", invites, e1);

  const { data: profile, error: e2 } = await supabaseAdmin.from('user_profiles').select('*').eq('email', 'diveshsarkar70@gmail.com');
  console.log("PROFILE:", profile, e2);
  
  // since user_profiles doesn't have email, let's look up auth.users!
  const { data: user, error: e3 } = await supabaseAdmin.auth.admin.listUsers();
  const targetUser = user?.users.find(u => u.email === 'diveshsarkar70@gmail.com');
  if (targetUser) {
    const { data: p } = await supabaseAdmin.from('user_profiles').select('*').eq('id', targetUser.id);
    console.log("TARGET PROFILE:", p);
  }
}
check();
