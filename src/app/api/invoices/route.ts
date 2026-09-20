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
      .select('facility_id')
      .eq('id', user.id)
      .single();

    if (!profile?.facility_id) {
      return NextResponse.json({ invoices: [] });
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

    if (!facility?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] });
    }

    // 3. Fetch past paid invoices from Stripe
    const invoices = await stripe.invoices.list({
      customer: facility.stripe_customer_id,
      limit: 5,
      // No status filter to ensure we can see unpaid/past_due invoices as well
    });

    // 4. Map them to a simpler format for the frontend
    const formattedInvoices = invoices.data.map(inv => ({
      id: inv.id,
      amount_paid: inv.amount_paid,
      amount_due: inv.amount_due,
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
