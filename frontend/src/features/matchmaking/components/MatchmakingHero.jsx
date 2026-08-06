import React from 'react';
import { motion } from 'framer-motion';
import { fadeSlideUp } from '@/lib/motion';

export const MatchmakingHero = () => {
  return (
    <motion.div {...fadeSlideUp} className="flex flex-col items-center text-center space-y-4 py-8">
      <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
        Find Your Next <span className="text-primary">Opponent</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Queue against developers with similar skill ratings and compete in real-time algorithmic battles. Prepare to prove your logic under pressure.
      </p>
    </motion.div>
  );
};
