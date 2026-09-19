import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if user is superadmin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all facilities
    const { data, error } = await supabaseAdmin
      .from('facilities')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return NextResponse.json({ facilities: data });
  } catch (error: any) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, plan, adminEmail } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Facility name is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check if user is superadmin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Insert new facility
    const { data: facility, error: facError } = await supabaseAdmin
      .from('facilities')
      .insert([{ 
        name, 
        plan: plan || 'pilot',
        subscription_status: 'trialing'
      }])
      .select()
      .single();

    if (facError) throw facError;
    
    // If admin email provided, invite them as an admin for this facility
    if (adminEmail && adminEmail.trim() !== '') {
      await supabaseAdmin
        .from('staff_invitations')
        .insert([{
           email: adminEmail.trim().toLowerCase(),
           role: 'admin',
           invited_by: user.id,
           facility_id: facility.id
        }]);
    }

    return NextResponse.json({ facility, success: true });
  } catch (error: any) {
    console.error('Error creating facility:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
