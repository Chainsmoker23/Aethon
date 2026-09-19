import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'staff') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Fetch active staff
    const { data: activeStaff } = await supabase
      .from('user_profiles')
      .select('id, full_name, role')
      .in('role', ['admin', 'staff', 'caregiver']);

    // 3. Fetch pending invites
    const { data: pendingInvites } = await supabase
      .from('staff_invitations')
      .select('id, email, role, created_at');

    return NextResponse.json({ 
      active: activeStaff || [],
      pending: pendingInvites || []
    });

  } catch (error: any) {
    console.error('Staff fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}
