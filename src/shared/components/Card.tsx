import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { defaultTransition, slideUp } from '../../animations/variants';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  glow?: boolean;
}

export default function Card({ children, hoverEffect = false, glow = false, className = '', ...props }: CardProps) {
  const isReduced = useReducedMotion();

  const hoverVariants = isReduced
    ? {}
    : {
        scale: 1.02,
        y: -3,
        boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.55)",
        borderColor: "rgba(99, 102, 241, 0.45)",
      };

  return (
    <motion.div
      variants={slideUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout="position"
      transition={defaultTransition}
      whileHover={hoverEffect || className.includes('hover:') ? hoverVariants : undefined}
      whileTap={hoverEffect ? { scale: 0.985 } : undefined}
      className={`bg-card border border-border rounded-2xl p-6 relative overflow-hidden ${
        glow ? 'shadow-glow border-primary/20' : ''
      } ${className}`}
      {...(props as any)}
    >
      {hoverEffect && !isReduced && (
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
}
