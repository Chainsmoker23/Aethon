import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function getSiteUrl(request: Request): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const siteUrl = getSiteUrl(request);
    const returnUrl = `${siteUrl}/management/settings/billing`;

    // 2. We need service role to check and update facilities table
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch user profile
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('facility_id, role')
      .eq('id', user.id)
      .single();

    if (!profile?.facility_id) {
       return NextResponse.json({ error: 'User not attached to a facility' }, { status: 400 });
    }

    if (profile.role !== 'admin' && profile.role !== 'superadmin') {
       return NextResponse.json({ error: 'Forbidden: Only admins can manage billing' }, { status: 403 });
    }

    // Check if facility already has a customer ID
    const { data: facility } = await supabaseAdmin
      .from('facilities')
      .select('stripe_customer_id')
      .eq('id', profile.facility_id)
      .single();

    let customerId = facility?.stripe_customer_id;

    if (!customerId) {
      // Find or create a Stripe customer for this user
      const existingCustomers = await stripe.customers.list({
        email: user.email!,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      } else {
        const customer = await stripe.customers.create({
          email: user.email!,
          metadata: { userId: user.id },
        });
        customerId = customer.id;
      }
      
      // Save customerId to Supabase
      await supabaseAdmin
          .from('facilities')
          .update({ stripe_customer_id: customerId })
          .eq('id', profile.facility_id);
    }

    // 4. Create a Stripe Checkout Session in 'setup' mode to save a card
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer: customerId,
      success_url: `${returnUrl}?card_added=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId: user.id,
        facilityId: profile.facility_id
      }
    });

    if (!session.url) {
      throw new Error('Stripe did not return a setup URL');
    }

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe Setup Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
