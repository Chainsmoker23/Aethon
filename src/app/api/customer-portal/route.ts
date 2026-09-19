import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. We need the customer's Stripe ID. 
    // Ideally this is saved in Supabase user_profiles via the webhook!
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    // Fallback: If not in DB, try to find them by email in Stripe
    if (!customerId) {
      const existingCustomers = await stripe.customers.list({
        email: user.email!,
        limit: 1,
      });
      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
      }
    }

    if (!customerId) {
      return new NextResponse('No billing account found for this user', { status: 404 });
    }

    // 3. Create a Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: 'https://aethon-amber.vercel.app/management/settings',
    });

    return NextResponse.redirect(session.url, 303);

  } catch (error: any) {
    console.error('Customer Portal Error:', error);
    return new NextResponse(`Error: ${error.message || 'Internal server error'}`, { status: 500 });
  }
}
