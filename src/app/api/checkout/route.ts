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
       return NextResponse.json({ error: 'Forbidden: Only admins can manage billing' }, { status: 403 });
    }

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

    // 3. Count active residents (beds) for dynamic pricing for THIS FACILITY
    const { count, error: countError } = await supabaseAdmin
      .from('residents')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', profile.facility_id);
    
    if (countError) {
      console.error('Supabase count error:', countError);
      return NextResponse.json({ error: 'Failed to calculate pricing' }, { status: 500 });
    }

    const totalBeds = count || 0;
    const billableBeds = Math.max(1, totalBeds);
    
    // CHF 12 per bed per month, billed annually
    const annualPricePerBedCHF = 12 * 12; // 144 CHF per bed per year

    const siteUrl = getSiteUrl(request);
    const returnUrl = `${siteUrl}/management/settings/billing`;

    // 4. Create Stripe Checkout Session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: 'Aethon Health - Active Bed License',
              description: 'Annual SaaS License per active bed (CHF 12/bed/month x 12 months).',
            },
            unit_amount: annualPricePerBedCHF * 100,
            recurring: {
              interval: 'year',
            },
          },
          quantity: billableBeds,
        },
      ],
      mode: 'subscription',
      success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId: user.id,
        facilityId: profile.facility_id,
        beds: billableBeds.toString(),
      },
    };

    if (facility?.stripe_customer_id) {
       sessionConfig.customer = facility.stripe_customer_id;
    } else {
       sessionConfig.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
