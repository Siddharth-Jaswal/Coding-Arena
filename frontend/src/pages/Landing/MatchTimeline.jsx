import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container } from '@/components/layout';
import { fadeSlideUp, staggerChildren } from '@/lib/motion';
import { Search, UserCheck, Timer, Keyboard, Upload, CheckCircle2, Trophy } from 'lucide-react';

const steps = [
  { label: "Find Match", icon: Search },
  { label: "Opponent", icon: UserCheck },
  { label: "Countdown", icon: Timer },
  { label: "Coding", icon: Keyboard },
  { label: "Submission", icon: Upload },
  { label: "Accepted", icon: CheckCircle2 },
  { label: "Victory", icon: Trophy },
];

export const MatchTimeline = () => {
  return (
    <Section className="relative z-10 py-16 border-y border-border/20 bg-black/20">
      <Container>
        <motion.div 
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerChildren}
          className="flex flex-col md:flex-row items-center justify-between gap-4 w-full overflow-x-auto pb-4 hide-scrollbar"
        >
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              <motion.div variants={fadeSlideUp} className="flex flex-col items-center gap-3 shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                  idx === steps.length - 1 
                    ? "bg-warning/20 border-warning text-warning shadow-glow-primary" 
                    : "bg-card border-border/50 text-muted-foreground"
                }`}>
                  <step.icon size={20} />
                </div>
                <span className={`text-xs font-medium uppercase tracking-wider ${
                  idx === steps.length - 1 ? "text-warning" : "text-muted-foreground"
                }`}>
                  {step.label}
                </span>
              </motion.div>
              
              {idx < steps.length - 1 && (
                <motion.div variants={fadeSlideUp} className="hidden md:block flex-1 h-[1px] bg-border/50 min-w-[30px]" />
              )}
            </React.Fragment>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
};
