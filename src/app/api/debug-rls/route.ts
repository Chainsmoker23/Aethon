import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // What does the DB actually say for this user's facility_id?
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('id, role, facility_id, full_name')
      .eq('id', user.id)
      .single();

    // How many residents does RLS return for this user via anon key?
    const { data: residents, error: rlsError } = await supabase
      .from('residents')
      .select('id, first_name, facility_id');

    // How many residents does the admin client see for this specific facility?
    const { data: adminResidents } = await supabaseAdmin
      .from('residents')
      .select('id, first_name, facility_id')
      .eq('facility_id', profile?.facility_id);

    return NextResponse.json({
      user_email: user.email,
      profile,
      rls_resident_count: residents?.length || 0,
      rls_residents: residents?.map(r => ({ id: r.id, name: r.first_name, fac: r.facility_id })),
      rls_error: rlsError?.message || null,
      admin_resident_count: adminResidents?.length || 0,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
