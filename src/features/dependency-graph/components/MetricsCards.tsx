import { motion } from 'framer-motion';
import Card from '../../../components/ui/Card';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import { staggerContainer, slideUp } from '../../../animations/variants';

interface MetricsCardsProps {
  summary: {
    totalComponents: number;
    totalHooks: number;
    unusedCount: number;
    circularCount: number;
    architectureScore?: number;
  };
}

export default function MetricsCards({ summary }: MetricsCardsProps) {
  const score = summary.architectureScore ?? 85;
  const getGrade = (s: number) => {
    if (s >= 85) return { grade: 'A+', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (s >= 70) return { grade: 'B', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' };
    if (s >= 50) return { grade: 'C', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { grade: 'D', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  };

  const gradeInfo = getGrade(score);

  const cards = [
    {
      title: 'COMPONENTS',
      value: summary.totalComponents,
      valueColor: 'text-[#7C6CFF]',
      glowColor: 'before:absolute before:top-0 before:right-0 before:w-16 before:h-16 before:bg-[#7C6CFF]/5 before:rounded-full before:filter before:blur-xl',
    },
    {
      title: 'HOOKS',
      value: summary.totalHooks,
      valueColor: 'text-[#A68CFF]',
      glowColor: 'before:absolute before:top-0 before:right-0 before:w-16 before:h-16 before:bg-[#A68CFF]/5 before:rounded-full before:filter before:blur-xl',
    },
    {
      title: 'UNUSED CODE',
      value: summary.unusedCount,
      valueColor: 'text-amber-400',
      glowColor: 'before:absolute before:top-0 before:right-0 before:w-16 before:h-16 before:bg-amber-400/5 before:rounded-full before:filter before:blur-xl',
    },
    {
      title: 'CIRCULAR CYCLES',
      value: summary.circularCount,
      valueColor: 'text-rose-400',
      glowColor: 'before:absolute before:top-0 before:right-0 before:w-16 before:h-16 before:bg-rose-400/5 before:rounded-full before:filter before:blur-xl',
    },
    {
      title: 'ARCHITECTURE SCORE',
      value: score,
      valueSuffix: '/100',
      valueColor: 'text-emerald-400',
      badge: gradeInfo,
      glowColor: 'before:absolute before:top-0 before:right-0 before:w-16 before:h-16 before:bg-emerald-400/5 before:rounded-full before:filter before:blur-xl',
    },
  ];

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 select-none"
    >
      {cards.map((card) => (
        <motion.div variants={slideUp} key={card.title}>
          <Card className={`relative overflow-hidden ${card.glowColor} py-5 px-5`}>
            <div className="flex items-center justify-between">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                {card.title}
              </span>
              {card.badge && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-extrabold border ${card.badge.color}`}>
                  Grade {card.badge.grade}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1 mt-2.5">
              <span className={`text-3xl font-extrabold ${card.valueColor} tracking-tight font-mono`}>
                <AnimatedCounter value={card.value} />
              </span>
              {card.valueSuffix && (
                <span className="text-xs font-mono text-zinc-500 font-bold">{card.valueSuffix}</span>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
