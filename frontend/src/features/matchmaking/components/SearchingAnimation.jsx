import React from 'react';
import { motion } from 'framer-motion';

export const SearchingAnimation = () => {
  return (
    <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
      {/* Outer Pulse */}
      <motion.div
        className="absolute w-full h-full rounded-full border-2 border-primary/20"
        animate={{ scale: [1, 1.5, 2], opacity: [0.5, 0.2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
      />
      {/* Middle Pulse */}
      <motion.div
        className="absolute w-24 h-24 rounded-full border-2 border-primary/40"
        animate={{ scale: [1, 1.3, 1.6], opacity: [0.8, 0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
      />
      {/* Inner Core */}
      <motion.div
        className="relative w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-8 h-8 rounded-full bg-primary animate-pulse" />
      </motion.div>
    </div>
  );
};
