import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MATCHMAKING_STATES } from '../constants/matchmaking.constants';
import { SearchingAnimation } from './SearchingAnimation';
import { Clock } from 'lucide-react';

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const QueueCard = ({ status, elapsedTime, estimatedTime, onFindMatch, onCancel }) => {
  const isSearching = status === MATCHMAKING_STATES.QUEUED || status === MATCHMAKING_STATES.JOINING;

  return (
    <Card className="border-primary/20 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.1)] overflow-hidden relative">
      <CardContent className="p-12 text-center flex flex-col items-center justify-center min-h-[300px]">
        <AnimatePresence mode="wait">
          
          {!isSearching ? (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center space-y-6"
            >
              <div className="p-4 rounded-full bg-primary/10 mb-2">
                <Clock className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to Battle?</h3>
                <p className="text-muted-foreground">Estimated wait time: ~{formatTime(estimatedTime)}</p>
              </div>
              <Button size="lg" className="w-full max-w-sm h-14 text-lg shadow-lg shadow-primary/20" onClick={onFindMatch}>
                Find Match
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="searching"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full flex flex-col items-center space-y-8"
            >
              <SearchingAnimation />
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-primary animate-pulse">Searching...</h3>
                <div className="flex items-center justify-center gap-4 text-muted-foreground">
                  <span>Elapsed: {formatTime(elapsedTime)}</span>
                  <span className="text-border">|</span>
                  <span>Expected: {formatTime(estimatedTime)}</span>
                </div>
              </div>

              <Button variant="outline" size="lg" className="w-full max-w-xs border-destructive/50 text-destructive hover:bg-destructive/10" onClick={onCancel}>
                Cancel Search
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
