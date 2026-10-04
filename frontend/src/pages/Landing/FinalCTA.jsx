import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Section, Container, Stack } from '@/components/layout';
import { Button } from '@/components/ui/Button';
import { fadeSlideUp } from '@/lib/motion';
import { Swords } from 'lucide-react';

export const FinalCTA = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleQueueUp = () => {
    if (isAuthenticated) {
      navigate('/matchmaking');
    } else {
      navigate('/login', { state: { from: { pathname: '/matchmaking' } } });
    }
  };

  return (
    <Section className="relative z-10 py-32 border-t border-border/20 mt-12 bg-black/40 overflow-hidden">
      {/* Heavy glow behind CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <Container>
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeSlideUp}
        >
          <Stack align="center" gap={8} className="text-center max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tightest leading-[1.1] text-gradient">
              Ready to Claim Your Rank?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of developers in the most competitive coding platform on the web.
            </p>
            <Button size="lg" className="mt-4 px-12 text-lg shadow-glow-primary" icon={Swords} onClick={handleQueueUp}>
              Queue Up Now
            </Button>
          </Stack>
        </motion.div>
      </Container>
    </Section>
  );
};
