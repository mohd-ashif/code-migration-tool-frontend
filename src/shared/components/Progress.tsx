import { motion } from 'framer-motion';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface ProgressProps {
  value: number;
  max: number;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Progress({ value, max, size = 'md', className = '' }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const height = size === 'sm' ? 'h-1' : 'h-1.5';
  const isReduced = useReducedMotion();

  return (
    <div className={`w-full bg-darkInput border border-border/40 rounded-full overflow-hidden ${height} ${className}`}>
      <motion.div
        initial={isReduced ? { width: `${percent}%` } : { width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-gradient-to-r from-primary to-secondary rounded-full h-full shadow-glow"
      />
    </div>
  );
}
