import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Swords } from 'lucide-react';
import { useMatchmakingStore } from '../store/useMatchmakingStore';
import { MATCHMAKING_STATES } from '../constants/matchmaking.constants';
import { useAuth } from '@/contexts/AuthContext';

export const MatchFoundOverlay = () => {
  const { status, roomId, opponent } = useMatchmakingStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isVisible = status === MATCHMAKING_STATES.MATCH_FOUND;

  useEffect(() => {
    if (isVisible && roomId) {
      // Transition to Contest Room after a dramatic pause
      const timeout = setTimeout(() => {
        navigate(`/contest/${roomId}`);
      }, 3500);

      return () => clearTimeout(timeout);
    }
  }, [isVisible, roomId, navigate]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl overflow-hidden"
        >
          {/* Animated Background Elements */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.15 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary via-background to-background"
          />

          <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-12"
            >
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400 uppercase text-center">
                Match Found
              </h1>
            </motion.div>

            <div className="flex items-center justify-center gap-8 md:gap-24 w-full">
              {/* Current User */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/50 bg-card/50 flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]">
                  <span className="text-2xl md:text-4xl font-bold uppercase">{user?.username?.[0] || 'Y'}</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-bold">{user?.username || 'You'}</h3>
                  <div className="flex items-center gap-1.5 justify-center text-yellow-500 mt-1">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">{user?.rating || 1500}</span>
                  </div>
                </div>
              </motion.div>

              {/* VS Divider */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: "spring", bounce: 0.5 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                  <Swords className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <span className="text-lg font-bold mt-2 text-muted-foreground uppercase tracking-widest">VS</span>
              </motion.div>

              {/* Opponent */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="flex flex-col items-center gap-4"
              >
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-destructive/50 bg-card/50 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                  <span className="text-2xl md:text-4xl font-bold uppercase">{opponent?.username?.[0] || 'O'}</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl md:text-2xl font-bold">{opponent?.username || 'Opponent'}</h3>
                  <div className="flex items-center gap-1.5 justify-center text-yellow-500 mt-1">
                    <Trophy className="w-4 h-4" />
                    <span className="font-medium">{opponent?.rating || 1500}</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="mt-16 text-muted-foreground animate-pulse flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-primary rounded-full" />
              Preparing Contest Room...
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
