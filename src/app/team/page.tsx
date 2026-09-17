"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, ArrowRight, Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

export default function TeamPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-zinc-900/50 landing-grid-bg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* === Elegant Color-Shifting Siri Aura Background === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] animate-blob-1" />
        <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full blur-[80px] md:blur-[120px] animate-blob-2" />
        <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] md:w-[800px] md:h-[800px] rounded-full blur-[100px] md:blur-[150px] animate-blob-3" />
        <div className="absolute top-[50%] left-[50%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full blur-[60px] md:blur-[100px] animate-blob-4 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* === Navigation === */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-[#0a0a0a]/60 backdrop-blur-2xl border-b border-slate-200 dark:border-zinc-800/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.jpg" 
              alt="Aethon Health Logo" 
              className="w-10 h-10 rounded-xl object-contain bg-white dark:bg-[#0a0a0a] shadow-sm border border-slate-200 dark:border-zinc-800/50" 
            />
            <span className="text-xl font-extrabold text-navy tracking-tight">
              Aethon<span className="font-light text-primary ml-0.5">Health</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
            <Link href="/#features" className="hover:text-navy transition-colors">Features</Link>
            <Link href="/#how-it-works" className="hover:text-navy transition-colors">How It Works</Link>
            <Link href="/#trust" className="hover:text-navy transition-colors">Trust</Link>
          </div>

          <div className="hidden md:block">
            <Link
              href="/login"
              className="px-5 py-2.5 bg-navy text-white text-sm font-bold rounded-full hover:bg-slate-800 transition-all shadow-lg shadow-navy/20 hover:shadow-navy/30 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-navy hover:bg-slate-200 dark:hover:bg-slate-700 dark:bg-slate-700 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-zinc-800/50 shadow-2xl p-6 flex flex-col gap-4 origin-top"
            >
              <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-navy py-2 border-b border-slate-100 dark:border-zinc-800/50 flex items-center justify-between">
                Features <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-navy py-2 border-b border-slate-100 dark:border-zinc-800/50 flex items-center justify-between">
                How It Works <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/#trust" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-navy py-2 border-b border-slate-100 dark:border-zinc-800/50 flex items-center justify-between">
                Trust & Security <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="mt-4 px-5 py-3.5 bg-navy text-white text-center text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-navy/20 active:scale-95 transition-transform">
                Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* === Team Section === */}
      <section className="relative max-w-6xl mx-auto px-5 md:px-6 py-16 md:py-24 min-h-[70vh]">
        <Reveal>
          <div className="text-center mb-10 md:mb-16">
            <h1 className="text-4xl md:text-6xl font-extrabold text-navy tracking-tighter leading-tight">
              Meet the <span className="gradient-text">Team</span>
            </h1>
            <p className="text-sm md:text-lg text-slate-500 dark:text-slate-500 font-medium mt-4 max-w-2xl mx-auto px-2 md:px-0">
              The experts behind Aethon Health, dedicated to transforming elderly care through intelligent technology, research, and design.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {/* Team Member 1 */}
          <Reveal delay={100} className="h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass-panel rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden h-full"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl shadow-sky-500/20 mb-6 shrink-0 flex items-center justify-center">
                <img 
                  src="/Flynn.jpg" 
                  alt="Flynn Werner" 
                  className="w-full h-full object-cover scale-125"
                />
              </div>
              <h3 className="text-xl font-extrabold text-navy mb-1">Flynn Werner</h3>
              <p className="text-[11px] md:text-xs font-bold text-sky-600 uppercase tracking-wider">Founder & CEO</p>
            </motion.div>
          </Reveal>

          {/* Team Member 2 */}
          <Reveal delay={200} className="h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass-panel rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden h-full"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-400 to-purple-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-violet-500/20 mb-6 shrink-0">
                DS
              </div>
              <h3 className="text-xl font-extrabold text-navy mb-1">Divesh Sarkar</h3>
              <p className="text-[11px] md:text-xs font-bold text-violet-600 uppercase tracking-wider">CTO & Researcher</p>
            </motion.div>
          </Reveal>

          {/* Team Member 3 */}
          <Reveal delay={300} className="h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              className="glass-panel rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden h-full"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden shadow-xl shadow-rose-500/20 mb-6 shrink-0 flex items-center justify-center">
                <img 
                  src="/Selena.jpg" 
                  alt="Selena Nguyen" 
                  className="w-full h-full object-cover scale-[1.15] translate-y-1"
                />
              </div>
              <h3 className="text-xl font-extrabold text-navy mb-1">Selena Nguyen</h3>
              <p className="text-[11px] md:text-xs font-bold text-rose-600 uppercase tracking-wider">COO</p>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* === Footer === */}
      <footer className="border-t border-slate-200 dark:border-zinc-800/60 bg-white dark:bg-[#0a0a0a]/60 backdrop-blur-xl mt-auto">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img 
              src="/logo.jpg" 
              alt="Aethon Health Logo" 
              className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-[#0a0a0a] shadow-sm border border-slate-200 dark:border-zinc-800/50" 
            />
            <span className="text-lg font-extrabold text-navy tracking-tight">
              Aethon<span className="font-light text-primary ml-0.5">Health</span>
            </span>
          </Link>
          <p className="text-sm font-bold text-slate-400">
            © {new Date().getFullYear()} Aethon Health. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-500">
            <Link href="/team" className="text-navy hover:text-sky-600 transition-colors">Team</Link>
            <Link href="/privacy" className="hover:text-navy transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-navy transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-navy transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
