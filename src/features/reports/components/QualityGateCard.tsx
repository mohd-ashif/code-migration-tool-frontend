import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { drawCheckmark, staggerContainer, slideUp } from '../../../animations/variants';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

interface QualityGateCardProps {
  validationGates: string[];
}

function AnimatedCheckIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg 
      className={`${className} text-success shrink-0`} 
      viewBox="0 0 12 12" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="5" className="opacity-20" stroke="currentColor" fill="none" />
      <motion.path
        d="M3.5 6 L5 7.5 L8.5 4.5"
        variants={drawCheckmark}
        initial="hidden"
        animate="visible"
      />
    </svg>
  );
}

export default function QualityGateCard({ validationGates }: QualityGateCardProps) {
  if (validationGates.length === 0) return null;
  const isReduced = useReducedMotion();

  return (
    <div className="space-y-2.5 select-none">
      <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-mono">
        <Shield className="w-3.5 h-3.5 text-success shrink-0" /> Quality Gates Status
      </h4>
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2"
      >
        {validationGates.map((gate, i) => {
          const isLastAndOdd = i === validationGates.length - 1 && validationGates.length % 2 !== 0;
          return (
            <motion.div
              variants={slideUp}
              whileHover={isReduced ? {} : { scale: 1.015 }}
              key={i}
              className={`flex items-center gap-2 p-2.5 bg-success/5 border border-success/15 rounded-xl text-[11px] text-success font-medium ${
                isLastAndOdd ? 'sm:col-span-2' : ''
              }`}
            >
              <AnimatedCheckIcon />
              <span className="truncate" title={gate}>
                {gate}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
