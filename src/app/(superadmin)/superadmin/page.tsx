"use client";

import { Building, Users, CreditCard, Plus, ArrowRight, Settings } from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function SuperAdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-zinc-100 p-8">
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
            <p className="text-3xl font-black">1</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            </div>
            <h3 className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider mb-1">Total Billable Beds</h3>
            <p className="text-3xl font-black">0</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-slate-500 dark:text-zinc-400 font-bold text-sm uppercase tracking-wider mb-1">Monthly Recurring Revenue</h3>
            <p className="text-3xl font-black">CHF 0</p>
          </div>
        </div>

        {/* Facilities List */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Facilities</h2>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-sm transition-colors">
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
                  <tr>
                    <td className="p-4">
                      <div className="font-bold">Aethon Alpha Hospital</div>
                      <div className="text-sm text-slate-500 dark:text-zinc-400 mt-0.5">ID: fdb3...</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 rounded-md text-xs font-black uppercase tracking-wider">Pilot</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md text-xs font-black uppercase tracking-wider">Active</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <a href="/management" className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
                          Enter Portal <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
