import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { facility_id } = await request.json();
    
    if (!facility_id) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check if user is superadmin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Verify they are a superadmin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update their facility_id
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ facility_id: facility_id })
      .eq('id', user.id);

    if (updateError) throw updateError;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error switching facility:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
