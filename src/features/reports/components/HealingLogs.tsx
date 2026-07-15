import { Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { staggerContainer, slideUp } from '../../../animations/variants';

interface HealingLogsProps {
  healedIssues: string[];
  manualReviews: string[];
}

export default function HealingLogs({ healedIssues, manualReviews }: HealingLogsProps) {
  return (
    <div className="space-y-4 select-none">
      {/* AI Healed Issues */}
      {healedIssues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 animate-pulse" /> AI Self-Healing Actions
          </h4>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-1.5"
          >
            {healedIssues.map((issue, i) => (
              <motion.div
                variants={slideUp}
                key={i}
                className="p-3 bg-primary/5 border border-primary/15 rounded-xl text-xs text-white/95 flex items-start gap-2.5 leading-relaxed"
              >
                <span className="px-2 py-0.5 bg-primary/20 text-primary border border-primary/20 rounded-md text-[8px] font-bold uppercase shrink-0 tracking-wider font-mono mt-0.5">
                  HEALED
                </span>
                <span>{issue}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Manual Actions */}
      {manualReviews.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase text-gray-500 tracking-widest flex items-center gap-1.5 font-mono">
            <AlertCircle className="w-3.5 h-3.5 text-warning shrink-0" /> Action Items Recommended
          </h4>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-1.5"
          >
            {manualReviews.map((review, i) => (
              <motion.div
                variants={slideUp}
                key={i}
                className="p-3 bg-warning/5 border border-warning/15 rounded-xl text-xs text-white/95 flex items-start gap-2.5 leading-relaxed"
              >
                <span className="px-2 py-0.5 bg-warning/20 text-warning border border-warning/20 rounded-md text-[8px] font-bold uppercase shrink-0 tracking-wider font-mono mt-0.5">
                  MANUAL
                </span>
                <span>{review}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
