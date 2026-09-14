"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart, Shield, MessageSquare, Activity, Bell, Clock,
  ArrowRight, CheckCircle2, Users, Building2, Sparkles,
  ChevronRight, Menu, X, CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/50 landing-grid-bg [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      
      {/* === Elegant Color-Shifting Siri Aura Background === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[250px] h-[250px] md:w-[500px] md:h-[500px] rounded-full blur-[80px] md:blur-[120px] animate-blob-1" />
        <div className="absolute top-[20%] right-[-5%] w-[300px] h-[300px] md:w-[600px] md:h-[600px] rounded-full blur-[80px] md:blur-[120px] animate-blob-2" />
        <div className="absolute bottom-[-10%] left-[20%] w-[350px] h-[350px] md:w-[800px] md:h-[800px] rounded-full blur-[100px] md:blur-[150px] animate-blob-3" />
        <div className="absolute top-[50%] left-[50%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] rounded-full blur-[60px] md:blur-[100px] animate-blob-4 -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* === Navigation === */}
      <nav className="sticky top-0 z-50 bg-white/60 backdrop-blur-2xl border-b border-slate-200/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.jpg" 
              alt="Aethon Health Logo" 
              className="w-10 h-10 rounded-xl object-contain bg-white shadow-sm border border-slate-200/50" 
            />
            <span className="text-xl font-extrabold text-navy tracking-tight">
              Aethon<span className="font-light text-primary ml-0.5">Health</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none" className="shrink-0 opacity-70">
              <rect width="32" height="32" rx="4" fill="#FF0000"/>
              <rect x="13" y="6" width="6" height="20" rx="1" fill="white"/>
              <rect x="6" y="13" width="20" height="6" rx="1" fill="white"/>
            </svg>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
            <a href="#features" className="hover:text-navy transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-navy transition-colors">How It Works</a>
            <a href="#trust" className="hover:text-navy transition-colors">Trust</a>
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
            className="md:hidden w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-navy hover:bg-slate-200 transition-colors"
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
              className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-slate-200/50 shadow-2xl p-6 flex flex-col gap-4 origin-top"
            >
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-navy py-2 border-b border-slate-100 flex items-center justify-between">
                Features <ChevronRight className="w-4 h-4 text-text-muted" />
              </a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-navy py-2 border-b border-slate-100 flex items-center justify-between">
                How It Works <ChevronRight className="w-4 h-4 text-text-muted" />
              </a>
              <a href="#trust" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-navy py-2 border-b border-slate-100 flex items-center justify-between">
                Trust & Security <ChevronRight className="w-4 h-4 text-text-muted" />
              </a>
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="mt-4 px-5 py-3.5 bg-navy text-white text-center text-base font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-navy/20 active:scale-95 transition-transform">
                Sign In <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* === Hero Section === */}
      <section className="relative max-w-6xl mx-auto px-5 md:px-6 pt-14 pb-16 md:pt-28 md:pb-36 flex flex-col items-center">
        <div className="flex flex-col items-center text-center relative z-20">


          <Reveal delay={100}>
            <h1 className="text-[2.5rem] md:text-7xl lg:text-8xl font-extrabold text-navy leading-[0.95] tracking-tighter max-w-4xl">
              Care that{" "}
              <span className="gradient-text">families</span>
              <br />
              can see
            </h1>
          </Reveal>

          <Reveal delay={200}>
            <p className="text-base md:text-xl text-text-secondary font-medium mt-6 md:mt-8 max-w-lg md:max-w-2xl leading-relaxed px-2 md:px-0">
              The intelligent platform — built for Swiss healthcare — that gives families real-time visibility
              into their loved one's care, while empowering staff with
              tools that actually work.
            </p>
          </Reveal>

          <Reveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 mt-10 md:mt-12 w-full sm:w-auto px-2 sm:px-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="w-full sm:w-auto">
                <Link
                  href="/login"
                  className="group px-6 md:px-8 py-3.5 md:py-4 bg-primary text-white text-sm md:text-base font-bold rounded-2xl hover:bg-primary-dark shadow-xl shadow-primary/25 hover:shadow-primary/40 flex items-center justify-center gap-2"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="w-full sm:w-auto">
                <a
                  href="#how-it-works"
                  className="px-6 md:px-8 py-3.5 md:py-4 bg-white/70 backdrop-blur-lg text-navy text-sm md:text-base font-bold rounded-2xl border border-slate-200/60 hover:bg-white shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  See How It Works
                </a>
              </motion.div>
            </div>
          </Reveal>

          <Reveal delay={400}>
            <p className="text-[10px] md:text-xs font-semibold text-text-muted mt-6 md:mt-8 flex items-center gap-2">
              <Shield className="w-3 h-3 md:w-3.5 md:h-3.5" />
              HIPAA Compliant · GDPR Ready · SOC 2 Type II
            </p>
          </Reveal>
        </div>

        {/* Hero Mockup emerging from bottom */}
        <Reveal delay={500} className="w-full mt-24 relative z-10 hidden md:block">
          <div>
            <div className="max-w-4xl mx-auto bg-white/40 backdrop-blur-3xl border border-white/60 rounded-t-[40px] shadow-2xl overflow-hidden h-[300px] p-6 flex gap-6 mask-bottom glass-glare">
            {/* Sidebar Mockup */}
            <div className="w-48 bg-white/50 rounded-2xl p-4 border border-white/40 flex flex-col gap-3">
              <div className="w-full h-8 bg-slate-200/50 rounded-lg mb-4" />
              <div className="w-full h-10 bg-primary/10 rounded-xl" />
              <div className="w-full h-10 bg-white/40 rounded-xl" />
              <div className="w-full h-10 bg-white/40 rounded-xl" />
            </div>
            {/* Main Area Mockup */}
            <div className="flex-1 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div className="w-48 h-10 bg-white/60 rounded-xl" />
                <div className="w-32 h-10 bg-white/60 rounded-xl" />
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white/60 border border-white/40 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
                  <div className="w-32 h-4 bg-slate-200/80 rounded-full" />
                  <div className="w-full h-20 bg-slate-100/50 rounded-xl mt-auto" />
                </div>
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-5 shadow-sm" />
              </div>
            </div>
          </div>
          </div>
        </Reveal>
      </section>

      {/* === The Challenge Section === */}
      <section className="relative max-w-6xl mx-auto px-5 md:px-6 py-16 md:py-24 border-t border-slate-200/50">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal direction="left">
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tighter mb-6 leading-[1.1]">
                The current state of care <br/>
                <span className="text-rose-500">is broken.</span>
              </h2>
              <p className="text-base md:text-lg text-text-secondary font-medium leading-relaxed mb-6">
                Staff are overwhelmed with paperwork. Families are left in the dark, constantly worrying and making phone calls just to get a simple update.
              </p>
              <p className="text-base md:text-lg text-text-secondary font-medium leading-relaxed mb-8">
                And caught in the middle are the residents—who deserve connection, dignity, and attentive care, but often feel isolated in the system.
              </p>
              
              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-200/30 blur-xl rounded-bl-full" />
                <p className="text-sm md:text-base font-bold text-rose-800 relative z-10 italic">
                  "I just want to know if my dad ate lunch today without feeling like I'm bothering the nurses."
                </p>
                <p className="text-xs font-semibold text-rose-600 mt-3 relative z-10 uppercase tracking-widest">— A frustrated family member</p>
              </div>
            </div>
          </Reveal>
          
          <Reveal direction="right">
            <div className="relative max-w-[280px] md:max-w-[320px] mx-auto">
              <div className="absolute inset-0 bg-slate-200/50 rounded-[40px] -rotate-3 blur-sm transform scale-105 opacity-60" />
              <img 
                src="/cartoon%20Images/a-depressed-senior-in-a-wheelchair-1.jpg" 
                alt="Depressed senior" 
                className="relative z-10 w-full h-auto drop-shadow-xl object-cover rounded-[40px] border border-slate-100"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* === Features Section (Bento Box) === */}
      <section id="features" className="relative max-w-6xl mx-auto px-5 md:px-6 py-16 md:py-24">
        <Reveal>
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tighter">
              Everything you need,{" "}
              <span className="gradient-text">nothing you don't</span>
            </h2>
            <p className="text-sm md:text-lg text-text-secondary font-medium mt-3 md:mt-4 max-w-xl mx-auto leading-relaxed px-2 md:px-0">
              Built from the ground up for modern elderly care facilities
              and the families they serve.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 md:auto-rows-[280px]">
          
          {/* Bento Item 1: Wide (Family Messaging) */}
          <Reveal delay={100} className="md:col-span-2 h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full glass-panel rounded-2xl md:rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-5 md:gap-8 overflow-hidden relative glass-glare shadow-lg"
            >
              <div className="flex-1 z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-blue-100 flex items-center justify-center mb-3 md:mb-4">
                  <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-1.5 md:mb-2 tracking-tight">Family Messaging</h3>
                <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed">
                  Secure, instant communication between staff and families. No more phone tag or lost sticky notes.
                </p>
              </div>
              <div className="w-full md:w-1/2 flex flex-col gap-2.5 md:gap-3 relative z-10 md:translate-x-10 md:translate-y-4">
                <div className="bg-white p-3 md:p-4 rounded-2xl rounded-br-sm shadow-md border border-slate-100 w-[85%] md:w-4/5 self-end">
                  <p className="text-xs md:text-sm font-medium text-navy">She ate all her breakfast and enjoyed the garden today! 🌻</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[9px] md:text-[10px] text-text-muted">10:42 AM</span>
                    <CheckCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-primary" />
                  </div>
                </div>
                <div className="bg-primary text-white p-3 md:p-4 rounded-2xl rounded-bl-sm shadow-md w-[85%] md:w-4/5 self-start">
                  <p className="text-xs md:text-sm font-medium">That's wonderful to hear. Thank you!</p>
                </div>
              </div>
            </motion.div>
          </Reveal>

          {/* Bento Item 2: Tall (Real-Time Vitals) */}
          <Reveal delay={200} className="md:row-span-2 h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full glass-panel rounded-2xl md:rounded-[32px] p-6 md:p-8 flex flex-col relative overflow-hidden glass-glare shadow-lg"
            >
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-emerald-400/10 rounded-bl-full blur-2xl" />
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-emerald-100 flex items-center justify-center mb-3 md:mb-4 relative z-10 animate-heartbeat">
                <Activity className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-1.5 md:mb-2 tracking-tight relative z-10">Real-Time Vitals</h3>
              <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed relative z-10">
                Live health tracking with intelligent alerts. Families see what matters, exactly when it matters.
              </p>
              <div className="mt-auto relative z-10 bg-white/60 border border-white/80 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-sm">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs md:text-sm font-bold text-navy">Heart Rate</span>
                  <span className="text-xl md:text-2xl font-black text-emerald-600">72 <span className="text-[10px] md:text-sm text-text-muted">bpm</span></span>
                </div>
                <div className="w-full h-10 md:h-12 flex items-center gap-1">
                  {[40, 70, 45, 90, 60, 80, 50, 75].map((h, i) => (
                    <motion.div 
                      key={i} 
                      className="flex-1 bg-emerald-200 rounded-full" 
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ type: "spring", delay: i * 0.1, bounce: 0.5 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </Reveal>

          {/* Bento Item 3: Square (Smart Alerts) */}
          <Reveal delay={300} className="h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full glass-panel rounded-2xl md:rounded-[32px] p-6 md:p-8 glass-glare shadow-lg"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-amber-100 flex items-center justify-center mb-3 md:mb-4">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-navy mb-1.5 md:mb-2 tracking-tight">Smart Alerts</h3>
              <p className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed">
                AI-prioritized alerts ensure critical issues are seen first. Never miss what matters.
              </p>
            </motion.div>
          </Reveal>

          {/* Bento Item 4: Square (Care Timeline) */}
          <Reveal delay={400} className="h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full glass-panel rounded-2xl md:rounded-[32px] p-6 md:p-8 glass-glare shadow-lg"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-violet-100 flex items-center justify-center mb-3 md:mb-4">
                <Clock className="w-5 h-5 md:w-6 md:h-6 text-violet-600" />
              </div>
              <h3 className="text-lg md:text-xl font-extrabold text-navy mb-1.5 md:mb-2 tracking-tight">Care Timeline</h3>
              <p className="text-xs md:text-sm text-text-secondary font-medium leading-relaxed">
                A chronological record of every visit note, medication, and milestone.
              </p>
            </motion.div>
          </Reveal>

          {/* Bento Item 5: Wide (HIPAA & Security) */}
          <Reveal delay={500} className="md:col-span-2 h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="h-full glass-panel rounded-2xl md:rounded-[32px] p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 overflow-hidden relative glass-glare shadow-lg"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-gradient-to-tr from-rose-400 to-orange-400 flex items-center justify-center text-white shadow-lg shrink-0 z-10">
                <Shield className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div className="z-10">
                <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-1.5 md:mb-2 tracking-tight">Enterprise Security</h3>
                <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed">
                  Fully HIPAA compliant and GDPR ready. End-to-end encryption ensures patient data never falls into the wrong hands.
                </p>
              </div>
            </motion.div>
          </Reveal>

        </div>
      </section>

      {/* === The Human Touch Section === */}
      <section className="relative max-w-6xl mx-auto px-5 md:px-6 py-16 md:py-24 overflow-hidden">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
          <Reveal direction="left" className="order-2 md:order-1 flex items-center justify-center">
            <div className="relative max-w-[280px] md:max-w-[360px] w-full mx-auto">
              {/* Decorative background blob */}
              <div className="absolute inset-0 bg-gradient-to-tr from-sky-200 to-emerald-200 rounded-[40px] rotate-3 blur-md transform scale-105 opacity-60" />
              <img 
                src="/cartoon%20Images/nurse-assisting.webp" 
                alt="Nurse assisting elderly patient" 
                className="relative z-10 w-full h-auto drop-shadow-2xl object-cover rounded-[40px] bg-white p-6 md:p-8 border border-slate-100"
              />

            </div>
          </Reveal>
          
          <Reveal direction="right" className="order-1 md:order-2">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 mb-6">
                <Sparkles className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold text-sky-700 tracking-wide uppercase">
                  The Human Touch
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tighter mb-6 leading-[1.1]">
                Technology that <br/>
                <span className="gradient-text">empowers care</span>
              </h2>
              <p className="text-base md:text-lg text-text-secondary font-medium leading-relaxed mb-6">
                At Aethon Health, we believe that software shouldn't replace the human element of caregiving—it should enhance it.
              </p>
              <p className="text-base md:text-lg text-text-secondary font-medium leading-relaxed mb-8">
                By automating the busywork, generating smart timelines, and streamlining communication, we give care workers their time back so they can focus on what truly matters: the residents.
              </p>
              <ul className="space-y-4">
                {[
                  "More face-to-face time with residents",
                  "Reduced burnout for care staff",
                  "Peace of mind for families"
                ].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 text-sm md:text-base font-bold text-navy">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      {item}
                   </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* === How It Works === */}
      <section id="how-it-works" className="relative max-w-6xl mx-auto px-5 md:px-6 py-16 md:py-24">
        <Reveal>
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tighter">
              Simple for <span className="gradient-text">everyone</span>
            </h2>
            <p className="text-sm md:text-lg text-text-secondary font-medium mt-3 md:mt-4 max-w-xl mx-auto px-2 md:px-0">
              Two portals, one seamless platform — designed so both sides feel heard.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-5 md:gap-8">
          <Reveal delay={100} direction="left" className="h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass-panel-heavy rounded-2xl md:rounded-3xl p-6 md:p-10 relative overflow-hidden group h-full shadow-lg"
            >
              <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-gradient-to-bl from-sky-400/20 to-transparent rounded-bl-full blur-xl" />
              
              {/* Subtle watermark illustration */}
              <div className="absolute bottom-0 right-0 w-48 md:w-64 opacity-5 pointer-events-none">
                <img src="/cartoon%20Images/doctor-explaining.webp" alt="" className="w-full h-auto" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-2 md:mb-3 tracking-tight">For Families</h3>
                <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed mb-5 md:mb-8">
                  Open the app, see how your loved one is doing today. Read care notes from staff, check medications, and message the care team directly.
                </p>
                <ul className="space-y-2.5 md:space-y-4">
                  {["Daily care updates & photos", "Medication tracking", "Direct staff messaging", "Escalation notifications"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 md:gap-3 text-xs md:text-sm font-bold text-navy bg-white/40 p-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-success shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </Reveal>

          <Reveal delay={200} direction="right" className="h-full">
            <motion.div 
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass-panel-heavy rounded-2xl md:rounded-3xl p-6 md:p-10 relative overflow-hidden group h-full shadow-lg"
            >
              <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-gradient-to-bl from-indigo-400/20 to-transparent rounded-bl-full blur-xl" />
              
              {/* Subtle watermark illustration */}
              <div className="absolute bottom-0 right-0 w-48 md:w-64 opacity-5 pointer-events-none">
                <img src="/cartoon%20Images/hospital-entrance.webp" alt="" className="w-full h-auto" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-extrabold text-navy mb-2 md:mb-3 tracking-tight">For Staff</h3>
                <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed mb-5 md:mb-8">
                  A command center built for care teams. Log notes, prescribe meds, respond to families, and manage escalations — all from one dashboard.
                </p>
                <ul className="space-y-2.5 md:space-y-4">
                  {["Resident management dashboard", "Visit notes & care timeline", "Medication prescriptions", "Family communication hub"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5 md:gap-3 text-xs md:text-sm font-bold text-navy bg-white/40 p-2 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-success shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* === Stats === */}
      <section id="trust" className="relative max-w-6xl mx-auto px-5 md:px-6 py-16 md:py-24">
        <Reveal>
          <div className="glass-panel-heavy rounded-3xl md:rounded-[40px] p-6 md:p-14 shadow-xl shadow-slate-200/50 border-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
              {[
                { value: "99.9%", label: "Uptime SLA" },
                { value: "< 2s", label: "Alert Delivery" },
                { value: "256-bit", label: "AES Encryption" },
                { value: "24/7", label: "Support" },
              ].map((stat, i) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl md:text-5xl font-black text-navy tracking-tighter">{stat.value}</p>
                  <p className="text-[10px] md:text-sm font-bold text-text-muted mt-1 md:mt-2 uppercase tracking-widest">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* === Swiss Precision Trust Banner === */}
      <section className="relative max-w-6xl mx-auto px-5 md:px-6 py-16 md:py-24">
        <Reveal>
          <div className="relative rounded-3xl md:rounded-[40px] overflow-hidden border border-red-100">
            {/* Swiss-inspired white background with subtle cross pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-red-50/30 to-white" />
            
            {/* Subtle Swiss Cross watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
              <svg width="400" height="400" viewBox="0 0 32 32" fill="none">
                <rect x="13" y="6" width="6" height="20" rx="1" fill="#FF0000"/>
                <rect x="6" y="13" width="20" height="6" rx="1" fill="#FF0000"/>
              </svg>
            </div>

            <div className="relative z-10 px-6 py-12 md:px-16 md:py-16">
              <div className="flex flex-col items-center text-center mb-10 md:mb-14">
                {/* Swiss badge */}
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-red-200 shadow-sm mb-6">
                  <svg width="20" height="20" viewBox="0 0 32 32" fill="none" className="shrink-0">
                    <rect width="32" height="32" rx="4" fill="#FF0000"/>
                    <rect x="13" y="6" width="6" height="20" rx="1" fill="white"/>
                    <rect x="6" y="13" width="20" height="6" rx="1" fill="white"/>
                  </svg>
                  <span className="text-xs font-bold text-red-700 uppercase tracking-widest">Built for Swiss Healthcare</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-extrabold text-navy tracking-tighter leading-[1.1]">
                  Swiss precision,<br/>
                  <span className="text-red-600">global trust</span>
                </h2>
                <p className="text-sm md:text-lg text-text-secondary font-medium mt-4 max-w-2xl mx-auto">
                  Aethon Health is designed from the ground up for the Swiss healthcare system — with the precision, privacy, and reliability that Switzerland is known for worldwide.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-5 md:gap-6">
                {/* Pillar 1: Data Sovereignty */}
                <Reveal delay={100}>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                      <Shield className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-base font-extrabold text-navy mb-2 tracking-tight">Swiss Data Sovereignty</h3>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">
                      Your data stays in Switzerland. Fully compliant with the Swiss Federal Act on Data Protection (FADP) and GDPR. Zero compromises on privacy.
                    </p>
                  </div>
                </Reveal>

                {/* Pillar 2: Multilingual */}
                <Reveal delay={200}>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                      <Users className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-base font-extrabold text-navy mb-2 tracking-tight">Multilingual by Default</h3>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">
                      Built for Switzerland's four-language reality. Interface and care notes flow seamlessly in Deutsch, Français, Italiano, and English.
                    </p>
                  </div>
                </Reveal>

                {/* Pillar 3: Precision */}
                <Reveal delay={300}>
                  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm h-full">
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                      <CheckCheck className="w-5 h-5 text-red-600" />
                    </div>
                    <h3 className="text-base font-extrabold text-navy mb-2 tracking-tight">Swiss-Grade Reliability</h3>
                    <p className="text-sm text-text-secondary font-medium leading-relaxed">
                      Like a Swiss timepiece, Aethon runs with relentless precision. 99.9% uptime, sub-second alerts, and infrastructure engineered for zero downtime.
                    </p>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* === Final CTA === */}
      <section className="relative max-w-6xl mx-auto px-5 md:px-6 pb-20 md:pb-32 pt-4 md:pt-8">
        <Reveal>
          <div className="relative rounded-3xl md:rounded-[40px] overflow-hidden shadow-2xl">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate-900 to-navy" />
            <div className="absolute inset-0 opacity-30 overflow-hidden mix-blend-screen pointer-events-none">
              <div className="absolute top-[-20%] right-[-10%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-cyan-400 blur-[80px] md:blur-[100px] animate-blob-1" />
              <div className="absolute bottom-[-20%] left-[-10%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] rounded-full bg-indigo-500 blur-[80px] md:blur-[120px] animate-blob-2" />
            </div>


            <div className="relative z-20 px-6 py-14 md:px-16 md:py-24 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 mb-6 md:mb-8">
                <svg width="16" height="16" viewBox="0 0 32 32" fill="none" className="shrink-0">
                  <rect width="32" height="32" rx="4" fill="#FF0000"/>
                  <rect x="13" y="6" width="6" height="20" rx="1" fill="white"/>
                  <rect x="6" y="13" width="20" height="6" rx="1" fill="white"/>
                </svg>
                <span className="text-[10px] md:text-xs font-bold text-white/80 uppercase tracking-widest">Made in Switzerland</span>
              </div>
              <h2 className="text-2xl md:text-6xl font-extrabold text-white tracking-tighter leading-tight max-w-3xl mx-auto">
                Ready to transform how families experience care?
              </h2>
              <p className="text-sm md:text-lg text-slate-300 font-medium mt-4 md:mt-6 max-w-xl mx-auto">
                Join forward-thinking Swiss care facilities already using Aethon to build trust, transparency, and peace of mind with families.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mt-8 md:mt-12 w-full sm:w-auto">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="w-full sm:w-auto">
                  <Link
                    href="/login"
                    className="group px-6 md:px-8 py-3.5 md:py-4 bg-white text-navy text-sm md:text-base font-bold rounded-2xl hover:bg-slate-100 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
                  >
                    Start Free Trial
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }} className="w-full sm:w-auto">
                  <a
                    href="#how-it-works"
                    className="px-6 md:px-8 py-3.5 md:py-4 bg-white/10 text-white text-sm md:text-base font-bold rounded-2xl border border-white/20 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    Learn More
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* === Footer === */}
      <footer className="border-t border-slate-200/60 bg-white/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img 
              src="/logo.jpg" 
              alt="Aethon Health Logo" 
              className="w-8 h-8 rounded-lg object-contain bg-white shadow-sm border border-slate-200/50" 
            />
            <span className="text-lg font-extrabold text-navy tracking-tight">
              Aethon<span className="font-light text-primary ml-0.5">Health</span>
            </span>
          </div>
          <p className="text-sm font-bold text-text-muted">
            © {new Date().getFullYear()} Aethon Health. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-bold text-text-secondary">
            <Link href="/team" className="hover:text-navy transition-colors">Team</Link>
            <a href="#" className="hover:text-navy transition-colors">Privacy</a>
            <a href="#" className="hover:text-navy transition-colors">Terms</a>
            <a href="#" className="hover:text-navy transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
