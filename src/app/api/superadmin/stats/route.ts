import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 1. Verify user is authenticated and is a superadmin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Fetch all user profiles to aggregate role statistics
    const { data: profiles, error } = await supabaseAdmin
      .from('user_profiles')
      .select('role');

    if (error) {
      throw error;
    }

    // 3. Aggregate statistics
    const stats = {
      total: profiles.length,
      superadmin: 0,
      admin: 0,
      staff: 0,
      caregiver: 0,
      family: 0,
      unknown: 0
    };

    profiles.forEach((p: any) => {
      const role = p.role || 'unknown';
      if (stats.hasOwnProperty(role)) {
        stats[role as keyof typeof stats]++;
      } else {
        stats.unknown++;
      }
    });

    return NextResponse.json({ stats });

  } catch (error: any) {
    console.error('Superadmin stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}
