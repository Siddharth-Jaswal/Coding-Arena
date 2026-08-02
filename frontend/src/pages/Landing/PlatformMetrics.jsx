import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container, GridLayout } from '@/components/layout';
import { StatCard } from '@/components/common/StatCard';
import { fadeSlideUp, staggerChildren } from '@/lib/motion';
import { Timer, Zap, Trophy, Code2 } from 'lucide-react';

export const PlatformMetrics = () => {
  return (
    <Section className="relative z-10">
      <Container>
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
          className="flex flex-col gap-12"
        >
          <motion.div variants={fadeSlideUp} className="text-center max-w-2xl mx-auto">
            <span className="text-primary font-medium tracking-widest uppercase text-xs mb-2 block">Beta Phase Engine</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Built for Speed</h2>
            <p className="text-muted-foreground text-lg">
              Performance metrics that matter. No fluff.
            </p>
          </motion.div>

          <GridLayout cols={4} gap={6}>
            <motion.div variants={fadeSlideUp}>
              <StatCard title="Avg Matchmaking" value="4.2s" icon={Timer} trend={-12} />
            </motion.div>
            <motion.div variants={fadeSlideUp}>
              <StatCard title="Execution Latency" value="< 50ms" icon={Zap} trend={-5} />
            </motion.div>
            <motion.div variants={fadeSlideUp}>
              <StatCard title="Starting ELO" value="1200" icon={Trophy} />
            </motion.div>
            <motion.div variants={fadeSlideUp}>
              <StatCard title="Active Problems" value="500+" icon={Code2} />
            </motion.div>
          </GridLayout>
        </motion.div>
      </Container>
    </Section>
  );
};
