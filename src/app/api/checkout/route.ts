import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-01-27.acacia', // Latest Stripe API version
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Calculate dynamic pricing (B2B Per Bed Model)
    // We fetch the count securely on the server so the client can't tamper with the price
    const { count } = await supabase.from('residents').select('*', { count: 'exact', head: true });
    const totalBeds = count || 0;
    
    // If they have 0 beds, we still charge for at least 1, or handle it as needed. 
    const billableBeds = Math.max(1, totalBeds);
    
    // CHF 12 per bed per month, billed annually
    const monthlyPricePerBedCHF = 12;
    const annualPricePerBedCHF = monthlyPricePerBedCHF * 12;
    
    // Stripe expects amounts in cents (Rappen for CHF)
    const totalAnnualCostInCents = billableBeds * annualPricePerBedCHF * 100;

    const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/management/settings/billing`;

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
              description: `Annual SaaS License for ${billableBeds} active beds.`,
              images: ['https://aethon-amber.vercel.app/logo.jpg'], // Optional nice branding
            },
            unit_amount: totalAnnualCostInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Use 'subscription' if setting up recurring billing with a Price ID, but 'payment' is simpler for V1
      success_url: `${returnUrl}?success=true`,
      cancel_url: `${returnUrl}?canceled=true`,
      metadata: {
        userId: user.id,
        beds: billableBeds.toString(),
      }
    });

    if (!session.url) {
      throw new Error('Failed to create Stripe session URL');
    }

    // Return the URL to the client
    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
