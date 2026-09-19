import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL !== 'http://localhost:3000') {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://aethon-amber.vercel.app';
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const siteUrl = getSiteUrl();
    const returnUrl = `${siteUrl}/management/settings/billing`;

    // 2. Find or create a Stripe customer for this user
    const existingCustomers = await stripe.customers.list({
      email: user.email!,
      limit: 1,
    });

    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
    }

    // 3. Create a Stripe Checkout Session in 'setup' mode to save a card
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'setup',
      customer: customerId,
      success_url: `${returnUrl}?card_added=true`,
      cancel_url: `${returnUrl}?canceled=true`,
    });

    if (!session.url) {
      throw new Error('Stripe did not return a setup URL');
    }

    return NextResponse.redirect(session.url, 303);

  } catch (error: any) {
    console.error('Stripe Setup Error:', error);
    return new NextResponse(`Error: ${error.message || 'Internal server error'}`, { status: 500 });
  }
}
