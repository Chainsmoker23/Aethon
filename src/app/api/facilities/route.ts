import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

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

    // Fetch all facilities with their resident counts
    const { data, error } = await supabaseAdmin
      .from('facilities')
      .select('*, residents(count)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Format the response to easily access the count
    const formattedData = data.map(fac => ({
      ...fac,
      resident_count: fac.residents?.[0]?.count || 0
    }));
    
    return NextResponse.json({ facilities: formattedData });
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

export async function DELETE(request: Request) {
  try {
    const { facility_id } = await request.json();
    
    if (!facility_id) {
      return NextResponse.json({ error: 'Facility ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('role, facility_id')
      .eq('id', user.id)
      .single();
      
    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prevent deleting the facility the superadmin is currently in
    if (profile.facility_id === facility_id) {
      return NextResponse.json({ error: 'Cannot delete the facility you are currently in. Switch to another facility first.' }, { status: 400 });
    }

    // 1. Fetch facility to get stripe_customer_id before deletion
    const { data: facilityToDelete } = await supabaseAdmin
      .from('facilities')
      .select('stripe_customer_id')
      .eq('id', facility_id)
      .single();

    // 2. Delete from Stripe to cancel subscriptions and avoid ghost billing
    if (facilityToDelete?.stripe_customer_id) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
        await stripe.customers.del(facilityToDelete.stripe_customer_id);
        console.log(`Deleted Stripe customer ${facilityToDelete.stripe_customer_id} for facility ${facility_id}`);
      } catch (stripeError) {
        console.error('Failed to delete Stripe customer:', stripeError);
        // Continue with DB deletion even if Stripe fails, but log it heavily
      }
    }

    // Cascade delete all data belonging to this facility
    await supabaseAdmin.from('family_visits').delete().eq('facility_id', facility_id);
    await supabaseAdmin.from('messages').delete().eq('facility_id', facility_id);
    await supabaseAdmin.from('medications').delete().eq('facility_id', facility_id);
    await supabaseAdmin.from('escalations').delete().eq('facility_id', facility_id);
    await supabaseAdmin.from('visit_notes').delete().eq('facility_id', facility_id);
    await supabaseAdmin.from('family_access').delete().eq('facility_id', facility_id);
    await supabaseAdmin.from('family_invitations').delete().eq('facility_id', facility_id);
    await supabaseAdmin.from('residents').delete().eq('facility_id', facility_id);
    await supabaseAdmin.from('staff_invitations').delete().eq('facility_id', facility_id);
    await supabaseAdmin.from('user_profiles').update({ facility_id: null }).eq('facility_id', facility_id);
    await supabaseAdmin.from('facilities').delete().eq('id', facility_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting facility:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
