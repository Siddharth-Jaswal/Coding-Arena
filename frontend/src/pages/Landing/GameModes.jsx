import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container, Stack, GridLayout } from '@/components/layout';
import { InteractiveCard } from '@/components/common/DomainCards';
import { CardContent } from '@/components/ui/Card';
import { fadeSlideUp, staggerChildren } from '@/lib/motion';
import { Swords, Shuffle, Users } from 'lucide-react';

const modes = [
  {
    title: "Ranked Match",
    tag: "Competitive",
    icon: Swords,
    desc: "Queue up solo and face off against an opponent of similar skill. Win to climb the global leaderboard and claim your ELO.",
  },
  {
    title: "Toss Mode",
    tag: "Strategic",
    icon: Shuffle,
    desc: "A rapid pre-game phase where both players take turns banning and picking algorithmic categories before the problem is revealed.",
  },
  {
    title: "Custom Lobby",
    tag: "1v1",
    icon: Users,
    desc: "Generate an invite link and challenge your friends, classmates, or coworkers directly. Ranked or unranked.",
  }
];

export const GameModes = () => {
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
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Choose Your Battle</h2>
            <p className="text-muted-foreground text-lg">
              Multiple ways to compete.
            </p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerChildren}
          >
            <GridLayout cols={3} gap={6}>
              {modes.map((mode, idx) => (
                <motion.div key={idx} variants={fadeSlideUp} className="h-full">
                  <InteractiveCard>
                    <CardContent className="p-6 flex flex-col h-full gap-4">
                      <div className="flex justify-between items-start">
                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-foreground shadow-glow-primary">
                          <mode.icon size={24} />
                        </div>
                        <span className="px-3 py-1 bg-white/5 border border-white/10 text-xs font-medium text-muted-foreground rounded-full">
                          {mode.tag}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{mode.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {mode.desc}
                        </p>
                      </div>
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
