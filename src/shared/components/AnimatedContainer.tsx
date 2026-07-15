import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../../animations/variants';

interface AnimatedContainerProps {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
}

export default function AnimatedContainer({
  children,
  className = '',
  stagger = false
}: AnimatedContainerProps) {
  return (
    <motion.div
      variants={stagger ? staggerContainer : fadeIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { AnimatePresence };
