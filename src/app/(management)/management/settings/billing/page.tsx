import { CreditCard, Receipt, Building2, AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { CheckoutButton } from "@/components/management/CheckoutButton";
import { AddCardButton } from "@/components/management/AddCardButton";
import { ManageBillingButton } from "@/components/management/ManageBillingButton";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BillingSettingsPage({ searchParams }: PageProps) {
  const params = searchParams ? await searchParams : {};
  const isSuccess = params.success === 'true';
  const isCardAdded = params.card_added === 'true';
  const isCanceled = params.canceled === 'true';

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Unauthorized</div>;
  }

  // Get user profile to find facility
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('facility_id')
    .eq('id', user.id)
    .single();

  let facilityData = null;
  let totalBeds = 0;

  if (profile?.facility_id) {
    // We need service role to read facilities and residents count bypassing some RLS if needed, 
    // but standard RLS for residents count is fine here.
    const { count } = await supabase.from('residents').select('*', { count: 'exact', head: true });
    totalBeds = count || 0;

    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const { data } = await supabaseAdmin
      .from('facilities')
      .select('*')
      .eq('id', profile.facility_id)
      .single();
    
    facilityData = data;
  }
  
  const isPilot = facilityData?.plan === 'pilot';
  
  // Calculate days left in pilot (90 days from created_at)
  let daysLeft = 90;
  if (facilityData?.created_at) {
    const createdDate = new Date(facilityData.created_at);
    const endDate = new Date(createdDate.getTime() + (90 * 24 * 60 * 60 * 1000));
    const today = new Date();
    daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const pricePerBed = 12; // CHF 12/bed/month
  const capacity = 50; 
  const usagePercentage = Math.min(100, Math.round((totalBeds / Math.max(capacity, totalBeds)) * 100));

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in pb-safe">
      
      {isSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-bold text-sm">Payment successful! Your Aethon Annual Plan is now active.</p>
        </div>
      )}

      {isCardAdded && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="font-bold text-sm">Payment method saved successfully!</p>
        </div>
      )}

      {isCanceled && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="font-bold text-sm">Checkout was canceled. Your pilot is still active.</p>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your facility&apos;s Aethon plan, licenses, and invoices.</p>
      </div>

      {isPilot && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs font-bold mb-3">
                <AlertCircle className="w-3.5 h-3.5" />
                90-Day Free Pilot
              </div>
              <h2 className="text-xl font-bold mb-1">Your trial ends in {daysLeft} days</h2>
              <p className="text-indigo-100 text-sm max-w-md">You are currently enjoying full access to Aethon Management Core. Upgrade to an annual plan to ensure uninterrupted access to resident baselines and shift handovers.</p>
            </div>
            <CheckoutButton />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Active Licenses
            </h3>
            <div className="text-right">
              <span className="text-sm font-bold text-slate-900 dark:text-white block">CHF {totalBeds * pricePerBed} <span className="text-slate-500 font-medium">/ mo</span></span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">CHF {pricePerBed} / bed</span>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500 dark:text-slate-400">Beds in use</span>
              <span className="font-bold text-slate-900 dark:text-white">{totalBeds} / {Math.max(capacity, totalBeds)}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${usagePercentage}%` }} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Billed Annually (Swiss SaaS Contract)
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Includes MWST 8.1%
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">Payment Method</h3>
            </div>
            <ManageBillingButton />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Powered securely by Stripe</p>
          
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-100 dark:border-zinc-800/80 rounded-xl mb-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">To manage existing cards, click Manage Portal.</p>
            <p className="text-xs text-slate-400 mt-1">Add a new card below to transition after your pilot.</p>
          </div>
          
          <AddCardButton />
        </div>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-400" />
            Billing History
          </h3>
          <ManageBillingButton label="View all in Stripe" />
        </div>
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <Receipt className="w-12 h-12 text-slate-200 dark:text-zinc-800 mb-3" />
          <h4 className="font-bold text-slate-900 dark:text-white mb-1">Invoices appear in Settings</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">Please refer to the main Settings page to view your recent invoices, or open the Stripe Portal.</p>
        </div>
      </div>
    </div>
  );
}
