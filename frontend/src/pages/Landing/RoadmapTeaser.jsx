import React from 'react';
import { motion } from 'framer-motion';
import { Section, Container, GridLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/Card';
import { fadeSlideUp, staggerChildren } from '@/lib/motion';

const roadmap = [
  { title: "Live Spectating", desc: "Watch high-ELO matches in real-time.", status: "Q3" },
  { title: "Seasonal Rankings", desc: "Earn exclusive badges at the end of each competitive season.", status: "Q3" },
  { title: "Team Battles", desc: "2v2 and 3v3 algorithmic relays.", status: "Q4" },
  { title: "AI Match Analysis", desc: "Post-game breakdown of your time complexity vs opponent.", status: "Q4" },
];

export const RoadmapTeaser = () => {
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
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">The Roadmap</h2>
            <p className="text-muted-foreground text-lg">
              We are just getting started. Here is what's coming to the Arena.
            </p>
          </motion.div>

          <GridLayout cols={4} gap={6}>
            {roadmap.map((item, idx) => (
              <motion.div key={idx} variants={fadeSlideUp} className="h-full">
                <Card className="h-full border-border/30 hover:border-border/80 transition-colors">
                  <CardContent className="p-6 flex flex-col justify-between h-full gap-4">
                    <div>
                      <span className="text-xs font-bold text-primary mb-2 block">{item.status}</span>
                      <h4 className="font-semibold text-lg">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </GridLayout>
        </motion.div>
      </Container>
    </Section>
  );
};
