export const standardEase = [0.16, 1, 0.3, 1]; // Premium Fluxora ease-out curve

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.4, ease: standardEase },
};

export const fadeSlideUp = {
  initial: { opacity: 0, y: 30, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -20, filter: 'blur(8px)' },
  transition: { duration: 0.8, ease: standardEase },
};

export const fadeScale = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.5, ease: standardEase },
};

export const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2, ease: 'easeOut' } },
};

export const hoverGlow = {
  whileHover: { 
    boxShadow: "0 0 20px -5px hsl(var(--primary) / 0.4)",
    borderColor: "hsl(var(--primary) / 0.5)",
    transition: { duration: 0.3 }
  },
};

export const buttonPress = {
  whileTap: { scale: 0.97, transition: { duration: 0.1 } },
};

export const cardHover = {
  ...hoverLift,
  whileHover: {
    y: -4,
    boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const pageTransition = {
  initial: { opacity: 0, filter: 'blur(4px)' },
  animate: { opacity: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, filter: 'blur(4px)' },
  transition: { duration: 0.6, ease: standardEase },
};

export const modalTransition = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: 20 },
  transition: {
    type: 'spring',
    damping: 25,
    stiffness: 300,
  },
};

export const drawerTransition = {
  initial: { opacity: 0, x: "100%" },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: "100%" },
  transition: { type: 'spring', damping: 30, stiffness: 300 },
};

export const dropdownTransition = {
  initial: { opacity: 0, scale: 0.95, y: -10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
