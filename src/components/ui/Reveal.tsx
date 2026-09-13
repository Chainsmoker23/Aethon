"use client";

import { motion } from "framer-motion";

export function Reveal({ 
  children, 
  delay = 0, 
  className = "",
  direction = "up"
}: { 
  children: React.ReactNode; 
  delay?: number; 
  className?: string;
  direction?: "up" | "left" | "right" | "none";
}) {
  const getInitial = () => {
    switch (direction) {
      case "up": return { opacity: 0, y: 20 };
      case "left": return { opacity: 0, x: 20 };
      case "right": return { opacity: 0, x: -20 };
      case "none": return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.8, 
        delay: delay / 1000, 
        type: "spring",
        bounce: 0.2
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
