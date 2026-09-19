import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST() {
  try {
    const supabase = await createClient();
    
    // 1. Verify user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch the user's facility ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single();
      
    if (!profile?.facility_id) {
       return NextResponse.json({ message: 'User not linked to a facility.' });
    }
    
    // Fetch the facility's stripe customer id using service role
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data: facility } = await supabaseAdmin
      .from('facilities')
      .select('stripe_customer_id, plan')
      .eq('id', profile.facility_id)
      .single();

    if (!facility?.stripe_customer_id || facility.plan !== 'annual') {
      return NextResponse.json({ message: 'Facility is not on an active annual plan, skipping sync.' });
    }

    // 3. Count exact active residents (beds) for THIS facility
    const { count, error: countError } = await supabaseAdmin
      .from('residents')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', profile.facility_id);
      
    if (countError) throw countError;
    
    const totalBeds = Math.max(1, count || 1); // Minimum 1 billable bed

    // 4. Retrieve their active Stripe subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: facility.stripe_customer_id,
      status: 'active',
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ message: 'No active Stripe subscription found.' });
    }

    const subscription = subscriptions.data[0];
    const subscriptionItemId = subscription.items.data[0].id;

    // 5. Update the quantity if it doesn't match
    if (subscription.items.data[0].quantity !== totalBeds) {
      await stripe.subscriptionItems.update(subscriptionItemId, {
        quantity: totalBeds,
        proration_behavior: 'always_invoice', // Instantly bills or credits the prorated difference
      });
      console.log(`Synced Stripe quantity to ${totalBeds}`);
    }

    return NextResponse.json({ success: true, quantity: totalBeds });

  } catch (error: any) {
    console.error('Billing Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync billing' }, { status: 500 });
  }
}
