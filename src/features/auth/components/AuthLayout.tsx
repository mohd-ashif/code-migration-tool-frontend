import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0B12] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Futuristic Background Blur Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#7C6CFF]/20 to-transparent blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#5C5CFF]/15 to-transparent blur-[120px]" />

      {/* Glassmorphic Container Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-[#12131F]/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        {/* Branding & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C6CFF] to-[#A297FF] mb-4 shadow-lg shadow-[#7C6CFF]/20">
            <span className="text-white font-extrabold text-xl">AG</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="text-zinc-400 text-xs mt-2 leading-relaxed">{subtitle}</p>}
        </div>

        {/* Inner Card Form Content */}
        {children}
      </motion.div>
    </div>
  );
}
