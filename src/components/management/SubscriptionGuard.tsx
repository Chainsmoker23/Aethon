"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckoutButton } from "./CheckoutButton";
import { AddCardButton } from "./AddCardButton";
import { ManageBillingButton } from "./ManageBillingButton";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [reason, setReason] = useState<"expired" | "past_due" | "unpaid" | null>(null);
  const [facility, setFacility] = useState<any>(null);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('user_profiles')
          .select('facility_id, role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'superadmin') {
          // Superadmins are never locked out of their own dashboard views
          setLoading(false);
          return;
        }

        if (profile?.facility_id) {
          const { data: fac } = await supabase
            .from('facilities')
            .select('plan, subscription_status, created_at')
            .eq('id', profile.facility_id)
            .single();

          if (fac) {
            setFacility(fac);
            const status = fac.subscription_status;
            
            // Check for failed payments
            if (status === 'past_due' || status === 'unpaid') {
              setReason(status);
              setLocked(true);
            } 
            // Check pilot expiration
            else if (fac.plan === 'pilot') {
              const createdDate = new Date(fac.created_at);
              const endDate = new Date(createdDate.getTime() + (90 * 24 * 60 * 60 * 1000));
              if (new Date() > endDate) {
                setReason("expired");
                setLocked(true);
              }
            }
          }
        }
      } catch (err) {
        console.error("Error checking subscription:", err);
      } finally {
        setLoading(false);
      }
    }

    checkSubscription();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
      </div>
    );
  }

  if (locked && !pathname?.includes('/management/settings/billing')) {
    return (
      <div className="absolute inset-0 z-50 bg-slate-50/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-8 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            {reason === 'expired' ? 'Your pilot has ended' : 'Payment Action Required'}
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm leading-relaxed">
            {reason === 'expired' 
              ? "Your 90-day free pilot of Aethon Health has expired. To continue accessing your resident records and facility intelligence, please upgrade to an active license."
              : "We were unable to process your most recent invoice. Please update your payment method to restore access to your facility."}
          </p>

          <div className="space-y-4">
            {reason === 'expired' ? (
              <CheckoutButton />
            ) : (
              <div className="flex flex-col items-center gap-4">
                <ManageBillingButton label="Update Payment Method in Stripe" />
              </div>
            )}
            
            <div className="pt-6 border-t border-slate-100 dark:border-zinc-800">
               <Link href="/management/settings/billing" className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                 View Billing Settings →
               </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
