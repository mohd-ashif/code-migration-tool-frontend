import { Variants } from 'framer-motion';

export const springTransition = {
  type: "spring",
  stiffness: 280,
  damping: 25,
  mass: 0.8
} as const;

export const defaultTransition = springTransition;

// Standard Fades
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.25 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
};

// Slide and Fades
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: defaultTransition
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: defaultTransition
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.15 }
  }
};

export const slideDown: Variants = {
  hidden: { opacity: 0, y: -15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: defaultTransition
  },
  exit: { 
    opacity: 0, 
    y: 10,
    transition: { duration: 0.15 }
  }
};

export const slideHorizontal: Variants = {
  hidden: (direction: number = 1) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30
  }),
  visible: {
    opacity: 1,
    x: 0,
    transition: defaultTransition
  },
  exit: (direction: number = 1) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
    transition: { duration: 0.2 }
  })
};

// Container Stagger Effects
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02
    }
  }
};

// SVG Draw Animations
export const drawCheckmark: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { type: "spring", stiffness: 100, damping: 15 },
      opacity: { duration: 0.1 }
    }
  }
};

// Shakes for Warnings
export const shake: Variants = {
  hidden: { x: 0 },
  visible: {
    x: [0, -6, 6, -6, 6, 0],
    transition: { duration: 0.35 }
  }
};
