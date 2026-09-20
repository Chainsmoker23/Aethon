"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, MessageCircle, Heart, Calendar, Loader2, Play, Users } from "lucide-react";

export function FamilyOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from('user_profiles')
      .select('has_completed_onboarding, role')
      .eq('id', user.id)
      .single();
      
    if (data && !data.has_completed_onboarding && data.role === 'family') {
      setIsOpen(true);
    }
    setLoading(false);
  };

  const completeOnboarding = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from('user_profiles')
        .update({ has_completed_onboarding: true })
        .eq('id', user.id);
    }
    setIsOpen(false);
    setSaving(false);
  };

  if (loading || !isOpen) return null;

  const steps = [
    {
      title: "Welcome to Aethon Health",
      desc: "Stay connected with your loved one's care team, every step of the way.",
      icon: <Users className="w-12 h-12 text-rose-500" />,
      color: "bg-rose-50 dark:bg-rose-900/30",
    },
    {
      title: "Direct Messaging",
      desc: "Communicate securely with the nursing staff and care managers in real-time.",
      icon: <MessageCircle className="w-12 h-12 text-sky-500" />,
      color: "bg-sky-50 dark:bg-sky-900/30",
    },
    {
      title: "Visit Planner",
      desc: "Schedule and manage your visits easily through the Family Portal calendar.",
      icon: <Calendar className="w-12 h-12 text-indigo-500" />,
      color: "bg-indigo-50 dark:bg-indigo-900/30",
    }
  ];

  const CurrentStep = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative"
      >
        <div className={`w-full h-32 flex items-center justify-center transition-colors duration-500 ${CurrentStep.color}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {CurrentStep.icon}
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="p-8 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{CurrentStep.title}</h2>
              <p className="text-slate-500 dark:text-zinc-400 font-medium leading-relaxed">{CurrentStep.desc}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-1.5 justify-center mt-8 mb-8">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-slate-800 dark:bg-white' : 'w-1.5 bg-slate-200 dark:bg-zinc-700'}`} 
              />
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {step < steps.length - 1 ? (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={completeOnboarding}
                disabled={saving}
                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Go to Dashboard <Play className="w-4 h-4 fill-current" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
