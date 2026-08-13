import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, XCircle, Code2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const MatchResultModal = ({ room, opponent, user, scores = {}, winnerId, matchResult }) => {
  const navigate = useNavigate();
  
  if (!room) return null;

  const currentScore = scores[user?.id] || 0;
  const opponentScore = opponent ? (scores[opponent.id] || 0) : 0;
  
  const isWinner = winnerId === user?.id;
  const isDraw = currentScore === opponentScore;

  const getTitle = () => {
    if (isDraw) return "Match Drawn!";
    return isWinner ? "Victory!" : "Defeat";
  };

  const getColor = () => {
    if (isDraw) return "text-yellow-500 shadow-yellow-500/50";
    return isWinner ? "text-emerald-500 shadow-emerald-500/50" : "text-rose-500 shadow-rose-500/50";
  };

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl relative"
      >
        {/* Header Background */}
        <div className={`absolute top-0 left-0 w-full h-32 opacity-10 bg-gradient-to-b ${
          isDraw ? 'from-yellow-500' : isWinner ? 'from-emerald-500' : 'from-rose-500'
        } to-transparent pointer-events-none`} />
        
        <div className="p-8 pb-6 flex flex-col items-center relative z-10 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 12, delay: 0.2 }}
            className={`w-20 h-20 rounded-full bg-background border-4 mb-4 flex items-center justify-center shadow-lg ${
              isDraw ? 'border-yellow-500/30' : isWinner ? 'border-emerald-500/30' : 'border-rose-500/30'
            }`}
          >
            {isDraw ? (
              <XCircle className={`w-10 h-10 ${getColor()}`} />
            ) : isWinner ? (
              <Trophy className={`w-10 h-10 ${getColor()}`} />
            ) : (
              <Code2 className={`w-10 h-10 ${getColor()}`} />
            )}
          </motion.div>
          
          <h1 className={`text-4xl font-black mb-2 tracking-tight ${getColor()}`}>
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold">
            Match Completed
          </p>
        </div>

        {/* Score comparison */}
        <div className="px-8 py-6 bg-black/20 border-y border-border/30 flex items-center justify-center gap-12">
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-muted-foreground mb-2">You</span>
            <span className="text-5xl font-mono font-bold text-foreground">{currentScore}</span>
            {matchResult?.ratings?.[user?.id] && (
               <div className="mt-3 flex items-center gap-2 text-sm">
                 <span className="text-muted-foreground">{matchResult.ratings[user.id].old}</span>
                 <ArrowRight size={14} className="text-muted-foreground/50" />
                 <span className="font-bold">{matchResult.ratings[user.id].new}</span>
                 <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${matchResult.ratings[user.id].diff >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                   {matchResult.ratings[user.id].diff > 0 ? '+' : ''}{matchResult.ratings[user.id].diff}
                 </span>
               </div>
            )}
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-black text-muted-foreground/30 px-4 py-2 bg-black/40 rounded-lg">
              VS
            </div>
            {matchResult?.reason === 'TIME_EXPIRED' && (
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Timeout</span>
            )}
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-sm font-medium text-muted-foreground mb-2 truncate max-w-[120px]">
              {opponent?.username || 'Opponent'}
            </span>
            <span className="text-5xl font-mono font-bold text-foreground">{opponentScore}</span>
            {matchResult?.ratings?.[opponent?.id] && (
               <div className="mt-3 flex items-center gap-2 text-sm">
                 <span className="text-muted-foreground">{matchResult.ratings[opponent.id].old}</span>
                 <ArrowRight size={14} className="text-muted-foreground/50" />
                 <span className="font-bold">{matchResult.ratings[opponent.id].new}</span>
                 <span className={`font-mono text-xs px-1.5 py-0.5 rounded ${matchResult.ratings[opponent.id].diff >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                   {matchResult.ratings[opponent.id].diff > 0 ? '+' : ''}{matchResult.ratings[opponent.id].diff}
                 </span>
               </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 flex flex-col sm:flex-row items-center gap-4 justify-center bg-background/50">
          <Button 
            variant="outline"
            className="w-full sm:w-auto min-w-[200px]"
            onClick={() => navigate('/dashboard')}
          >
            Return Dashboard
          </Button>
          <Button 
            variant="primary"
            className="w-full sm:w-auto min-w-[200px] gap-2"
            onClick={() => navigate('/arena')}
          >
            Find Another Match
            <ArrowRight size={16} />
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
