import React from 'react';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';

export const LiveScoreboard = ({
  currentUser,
  opponent,
  scores = {},
  status = 'waiting',
  // Prepared for future use
  penalties = {},
  attempts = {},
  runtimeBonus = {}
}) => {
  const currentScore = scores[currentUser?.id] || 0;
  const opponentScore = opponent ? (scores[opponent.id] || 0) : 0;

  const getScoreColor = (isWinner, isDraw, isFinished) => {
    if (!isFinished) return 'text-foreground';
    if (isDraw) return 'text-yellow-500';
    return isWinner ? 'text-emerald-500' : 'text-red-500 text-opacity-80';
  };

  const isFinished = status === 'finished';
  const isDraw = currentScore === opponentScore;

  return (
    <div className="bg-card/40 border border-border/50 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Live Score
        </h3>
        <Swords size={16} className="text-primary/50" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col items-center flex-1">
          <span className="text-xs text-muted-foreground mb-1 truncate w-full text-center">You</span>
          <motion.div 
            key={currentScore}
            initial={{ scale: 1.2, color: '#3b82f6' }}
            animate={{ scale: 1, color: isFinished ? undefined : '#ffffff' }}
            className={`text-3xl font-mono font-bold ${getScoreColor(currentScore > opponentScore, isDraw, isFinished)}`}
          >
            {currentScore}
          </motion.div>
          {penalties[currentUser?.id] > 0 ? (
            <div className="text-[11px] font-mono text-amber-400 mt-1 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <span>{penalties[currentUser.id]} pen</span>
              <span className="text-muted-foreground">(-{penalties[currentUser.id] * 5} pts)</span>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground/50 mt-1">0 penalties</span>
          )}
        </div>

        <div className="text-xl font-black text-muted-foreground/30">VS</div>

        <div className="flex flex-col items-center flex-1">
          <span className="text-xs text-muted-foreground mb-1 truncate w-full text-center">
            {opponent ? opponent.username : 'Waiting...'}
          </span>
          <motion.div 
            key={opponentScore}
            initial={{ scale: 1.2, color: '#ef4444' }}
            animate={{ scale: 1, color: isFinished ? undefined : '#ffffff' }}
            className={`text-3xl font-mono font-bold ${getScoreColor(opponentScore > currentScore, isDraw, isFinished)}`}
          >
            {opponentScore}
          </motion.div>
          {opponent && penalties[opponent?.id] > 0 ? (
            <div className="text-[11px] font-mono text-amber-400 mt-1 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <span>{penalties[opponent.id]} pen</span>
              <span className="text-muted-foreground">(-{penalties[opponent.id] * 5} pts)</span>
            </div>
          ) : (
            <span className="text-[10px] font-mono text-muted-foreground/50 mt-1">0 penalties</span>
          )}
        </div>
      </div>
    </div>
  );
};

