import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    
    // Verify admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin' && profile?.role !== 'staff' && profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id: targetId } = await params;
    
    // Parse query params to know if it's an invite or active staff
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (type === 'invite') {
      await supabaseAdmin.from('staff_invitations').delete().eq('id', targetId);
    } else {
      // It's an active staff member. We don't delete them from auth.users (requires service key).
      // We just downgrade their role so they can't access management anymore.
      await supabaseAdmin.from('user_profiles').update({ role: 'family' }).eq('id', targetId);
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
  }
}
