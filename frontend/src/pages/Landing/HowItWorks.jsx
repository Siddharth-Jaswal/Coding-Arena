import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container, Stack, GridLayout } from '@/components/layout';
import { InteractiveCard } from '@/components/common/DomainCards';
import { CardContent } from '@/components/ui/Card';
import { fadeSlideUp, staggerChildren } from '@/lib/motion';
import { Users, Shuffle, Code2 } from 'lucide-react';

const phases = [
  {
    title: "1. Queue Up",
    desc: "Enter the matchmaking pool. Our system pairs you with an opponent of similar ELO within seconds.",
    icon: Users,
    visual: (
      <div className="h-32 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  },
  {
    title: "2. The Toss",
    desc: "A rapid 15-second strategic phase. Ban categories you hate, pick categories you excel in.",
    icon: Shuffle,
    visual: (
      <div className="h-32 flex flex-col items-center justify-center gap-2">
        <span className="px-3 py-1 bg-destructive/20 text-destructive text-xs rounded-full line-through">Dynamic Prog</span>
        <span className="px-3 py-1 bg-success/20 text-success text-xs rounded-full">Graph Theory</span>
      </div>
    )
  },
  {
    title: "3. The Battle",
    desc: "20 minutes on the clock. Write the most optimal solution. First to pass all hidden test cases wins the ELO.",
    icon: Code2,
    visual: (
      <div className="h-32 flex items-center justify-center w-full px-8">
        <div className="w-full h-2 bg-border rounded-full overflow-hidden relative">
          <div className="absolute left-0 top-0 h-full bg-primary animate-pulse w-3/4" />
          <div className="absolute left-0 top-0 h-full bg-success/50 w-1/4" />
        </div>
      </div>
    )
  }
];

export const HowItWorks = () => {
  return (
    <Section className="relative z-10">
      <Container>
        <Stack gap={12}>
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeSlideUp}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">How A Match Works</h2>
            <p className="text-muted-foreground text-lg">
              Experience a competitive gameplay loop designed to test your algorithms under pressure.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerChildren}
          >
            <GridLayout cols={3} gap={6}>
              {phases.map((phase, idx) => (
                <motion.div key={idx} variants={fadeSlideUp} className="h-full">
                  <InteractiveCard>
                    <CardContent className="p-6 flex flex-col h-full gap-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary">
                          <phase.icon size={24} />
                        </div>
                        <h3 className="text-xl font-semibold">{phase.title}</h3>
                      </div>
                      
                      <div className="flex-1 bg-background/50 rounded-lg border border-border/50 flex items-center justify-center">
                        {phase.visual}
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {phase.desc}
                      </p>
                    </CardContent>
                  </InteractiveCard>
                </motion.div>
              ))}
            </GridLayout>
          </motion.div>
        </Stack>
      </Container>
    </Section>
  );
};
