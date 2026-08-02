import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container, GridLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/Card';
import { fadeSlideUp, staggerChildren } from '@/lib/motion';
import { XCircle, CheckCircle2 } from 'lucide-react';

export const WhyCodingArena = () => {
  return (
    <Section className="relative z-10 py-24 bg-black/40 border-y border-border/20">
      <Container>
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerChildren}
          className="flex flex-col gap-12"
        >
          <motion.div variants={fadeSlideUp} className="text-center">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Why Battle?</h2>
            <p className="text-muted-foreground text-lg">
              Solving algorithms alone is good. Solving them under pressure is better.
            </p>
          </motion.div>

          <GridLayout cols={2} gap={8} className="max-w-5xl mx-auto w-full">
            <motion.div variants={fadeSlideUp}>
              <Card className="h-full border-destructive/20 bg-destructive/5 relative overflow-hidden">
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-3 text-destructive">
                    <XCircle size={24} />
                    <h3 className="text-xl font-semibold">Traditional Practice</h3>
                  </div>
                  <ul className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">-</span> No time pressure
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">-</span> Zero adrenaline
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">-</span> Fake motivation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-destructive mt-1">-</span> Copy-pasting solutions
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeSlideUp}>
              <Card variant="glass" className="h-full border-primary/30 shadow-glow-primary relative overflow-hidden">
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-3 text-primary">
                    <CheckCircle2 size={24} />
                    <h3 className="text-xl font-semibold">Coding Arena</h3>
                  </div>
                  <ul className="space-y-4 text-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">+</span> Real-time countdown pressure
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">+</span> High-stakes ELO system
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">+</span> Forces actual understanding
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">+</span> Interview-ready mindset
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </GridLayout>
        </motion.div>
      </Container>
    </Section>
  );
};
