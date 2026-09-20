import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

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

    // 2. Fetch the user's facility ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('facility_id')
      .eq('id', user.id)
      .single();

    if (!profile?.facility_id) {
       return NextResponse.json({ error: 'User not attached to a facility' }, { status: 400 });
    }

    // Use service role to check facilities table for stripe_customer_id
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: facility } = await supabaseAdmin
      .from('facilities')
      .select('stripe_customer_id')
      .eq('id', profile.facility_id)
      .single();

    const customerId = facility?.stripe_customer_id;

    if (!customerId) {
      return NextResponse.json({ error: 'No billing account found for this facility' }, { status: 404 });
    }

    const siteUrl = getSiteUrl(request);
    const returnUrl = `${siteUrl}/management/settings/billing`;

    // 3. Create a Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Customer Portal Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
