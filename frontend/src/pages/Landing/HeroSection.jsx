import React from 'react';
import { motion } from 'framer-motion';
import { Container, Stack } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { fadeSlideUp, staggerChildren } from '@/lib/motion';
import { Swords } from 'lucide-react';
import { LiveBattleShowcase } from './LiveBattleShowcase';

export const HeroSection = () => {
  return (
    <Container className="pt-32 pb-16 relative z-10">
      <Stack align="center" gap={8} className="text-center max-w-4xl mx-auto">
        
        <motion.div variants={staggerChildren} initial="initial" animate="animate" className="flex flex-col items-center gap-6">
          <motion.div variants={fadeSlideUp}>
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium tracking-widest text-primary uppercase bg-primary/10 rounded-full border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Public Beta v1.0
            </span>
          </motion.div>
          
          <motion.h1 variants={fadeSlideUp} className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tightest leading-[1.1]">
            <span className="text-gradient">Ranked Algorithmic Battles</span>
          </motion.h1>
          
          <motion.p variants={fadeSlideUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Stop practicing in isolation. Queue up, face off against global developers in real-time, and claim your ELO. The ultimate proving ground is here.
          </motion.p>
          
          <motion.div variants={fadeSlideUp} className="flex flex-col sm:flex-row items-center gap-4 mt-4 w-full sm:w-auto justify-center">
            <Button size="lg" className="w-full sm:w-auto px-10 text-base" icon={Swords}>
              Find Match (Beta)
            </Button>
            <Button variant="glass" size="lg" className="w-full sm:w-auto px-10 text-base">
              View Leaderboard
            </Button>
          </motion.div>
        </motion.div>
        
        <motion.div 
          initial="initial"
          animate="animate"
          variants={fadeSlideUp}
          className="w-full mt-12 md:mt-24"
        >
          <LiveBattleShowcase />
        </motion.div>
        
      </Stack>
    </Container>
  );
};
