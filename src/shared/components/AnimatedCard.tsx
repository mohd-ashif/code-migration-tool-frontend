import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { defaultTransition, slideUp } from '../../animations/variants';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  layoutId?: string;
  delay?: number;
}

export default function AnimatedCard({
  children,
  className = '',
  onClick,
  layoutId,
  delay = 0
}: AnimatedCardProps) {
  const isReduced = useReducedMotion();

  const hoverVariants = isReduced
    ? {}
    : {
        scale: 1.015,
        y: -3,
        boxShadow: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
        borderColor: "rgba(99, 102, 241, 0.4)", // Indigo glow
      };

  return (
    <motion.div
      layoutId={layoutId}
      layout="position"
      variants={slideUp}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ ...defaultTransition, delay }}
      whileHover={onClick || className.includes('hover:') ? hoverVariants : undefined}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      onClick={onClick}
      className={`p-6 bg-card border border-border rounded-2xl relative overflow-hidden ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Background glow hover shimmer element */}
      {onClick && !isReduced && (
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
}
