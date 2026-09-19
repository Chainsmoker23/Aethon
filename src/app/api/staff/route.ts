import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 1. Verify user is authenticated and is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, facility_id')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'superadmin' && profile?.role !== 'admin' && profile?.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Fetch active staff (ONLY for this facility)
    const { data: activeStaff } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, role')
      .in('role', ['admin', 'staff', 'caregiver'])
      .eq('facility_id', profile.facility_id);

    // 3. Fetch pending invites (ONLY for this facility)
    const { data: pendingInvites } = await supabaseAdmin
      .from('staff_invitations')
      .select('id, email, role, created_at')
      .eq('facility_id', profile.facility_id);

    return NextResponse.json({ 
      active: activeStaff || [],
      pending: pendingInvites || []
    });

  } catch (error: any) {
    console.error('Staff fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}
