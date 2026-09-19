import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function getSiteUrl(): string {
  // Vercel provides this automatically in production
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Count active residents (beds) for dynamic pricing
    const { count, error: countError } = await supabase.from('residents').select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Supabase count error:', countError);
      return NextResponse.json({ error: 'Failed to calculate pricing' }, { status: 500 });
    }

    const totalBeds = count || 0;
    const billableBeds = Math.max(1, totalBeds);
    
    // CHF 12 per bed per month, billed annually
    const annualPricePerBedCHF = 12 * 12; // 144 CHF per bed per year
    
    // Stripe expects amounts in the smallest currency unit (Rappen for CHF)
    const totalAnnualCostInRappen = billableBeds * annualPricePerBedCHF * 100;

    const siteUrl = getSiteUrl();
    const returnUrl = `${siteUrl}/management/settings/billing`;

    // 3. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: 'chf',
            product_data: {
              name: 'Aethon Health - Annual Plan',
              description: `Annual SaaS License for ${billableBeds} active bed${billableBeds > 1 ? 's' : ''} (CHF 12/bed/month × 12 months).`,
            },
            unit_amount: totalAnnualCostInRappen,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId: user.id,
        beds: billableBeds.toString(),
      },
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }

    return NextResponse.redirect(session.url, 303);

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return new NextResponse(`Error: ${error.message || 'Internal server error'}`, { status: 500 });
  }
}
