import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET() {
  try {
    const supabase = await createClient();
    
    // 1. Verify user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get customer ID
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] });
    }

    // 3. Fetch past paid invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: profile.stripe_customer_id,
      limit: 5,
      status: 'paid', // Only show paid invoices
    });

    // 4. Map them to a simpler format for the frontend
    const formattedInvoices = invoices.data.map(inv => ({
      id: inv.id,
      amount_paid: inv.amount_paid,
      currency: inv.currency,
      status: inv.status,
      created: inv.created,
      hosted_invoice_url: inv.hosted_invoice_url,
      pdf: inv.invoice_pdf,
    }));

    return NextResponse.json({ invoices: formattedInvoices });

  } catch (error: any) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}
