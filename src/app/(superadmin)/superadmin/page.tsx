"use client";

import { Building, Users, CreditCard, Plus, ArrowRight, Settings, Loader2 } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function SuperAdminPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFacility, setNewFacility] = useState({ name: "", plan: "pilot", adminEmail: "" });

  const fetchFacilities = async () => {
    try {
      const res = await fetch('/api/facilities');
      const data = await res.json();
      if (data.facilities) {
        setFacilities(data.facilities);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/facilities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFacility)
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      await fetchFacilities();
      setIsModalOpen(false);
      setNewFacility({ name: "", plan: "pilot", adminEmail: "" });
    } catch (error: any) {
      alert("Failed to create facility: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitchFacility = async (facilityId: string) => {
    try {
      const res = await fetch('/api/facilities/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility_id: facilityId })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      // Navigate to management
      window.location.href = '/management';
    } catch (error: any) {
      alert("Failed to switch facility: " + error.message);
    }
  };

  // Calculate live metrics
  const totalBeds = facilities.reduce((sum, fac) => sum + (fac.resident_count || 0), 0);
  const mrr = facilities.reduce((sum, fac) => {
    if (fac.subscription_status === 'active' && fac.plan === 'annual') return sum + 1999;
    if (fac.subscription_status === 'active' && fac.plan === 'pilot') return sum + 499;
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 p-8 relative">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500">
                Aethon God Mode
              </span>
              <Settings className="w-6 h-6 text-indigo-500" />
            </h1>
            <p className="text-slate-500 dark:text-zinc-400 font-medium mt-2">
              Super Admin Backoffice. Manage all facilities and global settings.
            </p>
          </div>
          <SignOutButton className="px-6 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
            Sign Out
          </SignOutButton>
        </header>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center mb-4">
              <Building className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider mb-1">Active Facilities</h3>
            <p className="text-3xl font-black">{loading ? '-' : facilities.length}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider mb-1">Total Billable Beds</h3>
            <p className="text-3xl font-black">{loading ? '-' : totalBeds}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider mb-1">Monthly Recurring Revenue</h3>
            <p className="text-3xl font-black">{loading ? '-' : `$${mrr.toLocaleString()}`}</p>
          </div>
        </div>

        {/* Facilities List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Facilities</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Facility
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-4 font-bold text-sm text-slate-500 dark:text-zinc-400">Facility Name</th>
                    <th className="p-4 font-bold text-sm text-slate-500 dark:text-zinc-400">Plan</th>
                    <th className="p-4 font-bold text-sm text-slate-500 dark:text-zinc-400">Status</th>
                    <th className="p-4 font-bold text-sm text-slate-500 dark:text-zinc-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                  {loading ? (
                     <tr><td colSpan={4} className="p-8 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
                  ) : facilities.length === 0 ? (
                     <tr><td colSpan={4} className="p-8 text-center text-slate-500 font-medium">No facilities found.</td></tr>
                  ) : (
                    facilities.map((fac) => (
                      <tr key={fac.id}>
                        <td className="p-4">
                          <div className="font-bold">{fac.name}</div>
                          <div className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5 flex items-center gap-2">
                             ID: {fac.id.split('-')[0]}...
                             <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded-md">
                               Created: {new Date(fac.created_at).toLocaleDateString()}
                             </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md text-xs font-black uppercase tracking-wider">{fac.plan || 'pilot'}</span>
                        </td>
                        <td className="p-4">
                          {fac.subscription_status === 'active' ? (
                            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-xs font-black uppercase tracking-wider">Active</span>
                          ) : fac.subscription_status === 'past_due' ? (
                            <span className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-xs font-black uppercase tracking-wider">Past Due</span>
                          ) : (
                             <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-md text-xs font-black uppercase tracking-wider">Trialing</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <button onClick={() => handleSwitchFacility(fac.id)} className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer">
                              Enter Portal <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* New Facility Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Create New Facility</h2>
              <p className="text-sm text-slate-500 mb-6">Provision a new multi-tenant organization.</p>
              
              <form onSubmit={handleCreateFacility} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Facility Name</label>
                  <input
                    type="text" required
                    value={newFacility.name}
                    onChange={e => setNewFacility({...newFacility, name: e.target.value})}
                    placeholder="e.g. Geneva Care Home"
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Initial Plan</label>
                  <select
                    value={newFacility.plan}
                    onChange={e => setNewFacility({...newFacility, plan: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="pilot">Pilot (Trial)</option>
                    <option value="annual">Annual (Pro)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1.5">Facility Admin Email (Optional)</label>
                  <input
                    type="email"
                    value={newFacility.adminEmail}
                    onChange={e => setNewFacility({...newFacility, adminEmail: e.target.value})}
                    placeholder="manager@hospital.com"
                    className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/40"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">This email will automatically receive an invitation link to become the Facility Admin.</p>
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl font-bold text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center disabled:opacity-70"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Provision Facility'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
