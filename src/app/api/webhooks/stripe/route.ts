import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// We need a service role key to bypass RLS in webhooks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    let event;

    try {
      if (!endpointSecret) throw new Error('Missing Stripe Webhook Secret');
      event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // This is the user_id we passed in the metadata when creating the session
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        
        if (userId) {
          // Update the user's profile with their new subscription status
          const { error } = await supabase
            .from('user_profiles')
            .update({ 
              plan: 'annual', 
              stripe_customer_id: customerId,
              subscription_status: 'active' 
            })
            .eq('id', userId);
            
          if (error) {
            console.error('Error updating user profile in Supabase:', error);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        
        // Exact status from Stripe ('active', 'past_due', 'canceled', 'unpaid', etc)
        const status = subscription.status;
        const plan = (status === 'active' || status === 'past_due') ? 'annual' : 'pilot';
        
        await supabase
          .from('user_profiles')
          .update({ subscription_status: status, plan: plan })
          .eq('stripe_customer_id', customerId);
          
        break;
      }
      
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse('Webhook handled successfully', { status: 200 });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new NextResponse('Internal Webhook Error', { status: 500 });
  }
}
