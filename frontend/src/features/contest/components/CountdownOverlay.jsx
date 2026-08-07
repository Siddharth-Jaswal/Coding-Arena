import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const CountdownOverlay = ({ startsInSeconds = 3 }) => {
  const [timeLeft, setTimeLeft] = useState(startsInSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none overflow-hidden">
      <AnimatePresence mode="wait">
        {timeLeft > 3 && (
          <motion.div
            key="ready"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-6xl md:text-8xl font-black text-white tracking-widest text-center"
          >
            GET READY
            <div className="text-xl md:text-2xl mt-4 font-mono text-primary/80 font-medium">
              Match begins in {timeLeft}s
            </div>
          </motion.div>
        )}
        
        {timeLeft <= 3 && timeLeft > 0 && (
          <motion.div
            key={timeLeft}
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-[12rem] font-black text-white/90 drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            {timeLeft}
          </motion.div>
        )}

        {timeLeft === 0 && (
          <motion.div
            key="go"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="text-[10rem] font-black text-emerald-500 drop-shadow-[0_0_60px_rgba(16,185,129,0.4)]"
          >
            GO!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
