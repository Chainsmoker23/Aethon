import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function PUT(request: Request) {
  try {
    const { facilityName, ...settings } = await request.json();

    const supabase = await createClient();
    
    // 1. Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch the user's facility and role
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('facility_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.facility_id) {
       return NextResponse.json({ error: 'User not attached to a facility' }, { status: 400 });
    }
    
    if (profile.role !== 'admin' && profile.role !== 'superadmin') {
       return NextResponse.json({ error: 'Forbidden: Only admins can manage facility settings' }, { status: 403 });
    }

    // 3. Update the facilities table (requires service role as RLS might not let normal admins update)
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabaseAdmin
      .from('facilities')
      .update({ 
        name: facilityName,
        settings: settings 
      })
      .eq('id', profile.facility_id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
