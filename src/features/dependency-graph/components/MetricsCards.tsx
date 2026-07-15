import { motion } from 'framer-motion';
import Card from '../../../shared/components/Card';
import AnimatedCounter from '../../../shared/components/AnimatedCounter';
import { staggerContainer, slideUp } from '../../../animations/variants';

interface MetricsCardsProps {
  summary: {
    totalComponents: number;
    totalHooks: number;
    unusedCount: number;
    circularCount: number;
  };
}

export default function MetricsCards({ summary }: MetricsCardsProps) {
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
      valueColor: 'text-warning',
      glowColor: 'before:absolute before:top-0 before:right-0 before:w-16 before:h-16 before:bg-warning/5 before:rounded-full before:filter before:blur-xl',
    },
    {
      title: 'CIRCULAR CYCLES',
      value: summary.circularCount,
      valueColor: 'text-success',
      glowColor: 'before:absolute before:top-0 before:right-0 before:w-16 before:h-16 before:bg-success/5 before:rounded-full before:filter before:blur-xl',
    },
  ];

  return (
    <motion.div 
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 select-none"
    >
      {cards.map((card) => (
        <motion.div variants={slideUp} key={card.title}>
          <Card className={`relative overflow-hidden ${card.glowColor} py-5 px-6`}>
            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
              {card.title}
            </span>
            <span className={`block text-3xl font-extrabold mt-2.5 ${card.valueColor} tracking-tight font-mono`}>
              <AnimatedCounter value={card.value} />
            </span>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
