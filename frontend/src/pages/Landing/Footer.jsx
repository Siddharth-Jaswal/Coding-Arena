import React from 'react';
import { Container, GridLayout, Stack } from '@/components/layout';

export const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/20 bg-background/50 pt-16 pb-8">
      <Container>
        <GridLayout cols={4} gap={8} className="mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="font-bold text-xl tracking-tightest text-foreground mb-4">CODING<span className="text-primary">ARENA</span></div>
            <p className="text-muted-foreground text-sm max-w-sm">
              The ultimate multiplayer competitive programming platform. Ranked algorithmic battles for developers.
            </p>
          </div>
          
          <Stack gap={4}>
            <h4 className="font-semibold text-foreground">Platform</h4>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Play Now</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Leaderboard</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Roadmap</a>
          </Stack>
          
          <Stack gap={4}>
            <h4 className="font-semibold text-foreground">Developers</h4>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">GitHub</a>
            <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Open Source</a>
          </Stack>
        </GridLayout>
        
        <div className="border-t border-border/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Coding Arena. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};
