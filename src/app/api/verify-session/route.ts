import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify this session actually belongs to this user
    if (session.metadata?.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized session' }, { status: 403 });
    }

    // If payment was successful, update the database directly! 
    // This acts as a reliable fallback if the webhook fails or is delayed.
    if (session.payment_status === 'paid' || session.status === 'complete') {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          plan: 'annual', 
          stripe_customer_id: session.customer as string,
          subscription_status: 'active' 
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }
      
      return NextResponse.json({ success: true, plan: 'annual' });
    }

    return NextResponse.json({ success: false, status: session.payment_status });

  } catch (error: any) {
    console.error('Session Verification Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
