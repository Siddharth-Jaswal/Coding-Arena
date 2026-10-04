import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  XCircle, 
  Code2, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  RotateCcw, 
  LayoutDashboard 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useMatchmakingStore } from '@/features/matchmaking/store/useMatchmakingStore';
import { TierBadge } from './TierBadge';
import { getTier } from '../constants/tiers';

// Smooth counting animation hook
function useCountUp(target, start = 0, duration = 1400) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    let startTimestamp = null;
    const startVal = Number(start) || 0;
    const endVal = Number(target) || 0;
    const diff = endVal - startVal;

    if (diff === 0) {
      setCount(endVal);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(startVal + diff * ease));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const handle = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(handle);
  }, [target, start, duration]);

  return count;
}

export const MatchResultModal = ({ room, opponent, user, scores = {}, penalties = {}, winnerId, matchResult }) => {
  const navigate = useNavigate();
  
  if (!room) return null;

  const currentScore = scores[user?.id] || 0;
  const opponentScore = opponent ? (scores[opponent.id] || 0) : 0;
  
  const userPenalties = penalties?.[user?.id] ?? matchResult?.penalties?.[user?.id] ?? 0;
  const opponentPenalties = opponent ? (penalties?.[opponent.id] ?? matchResult?.penalties?.[opponent.id] ?? 0) : 0;

  const isWinner = winnerId === user?.id;
  const isDraw = currentScore === opponentScore;


  // Extract Rating data from matchResult
  const userRatingData = matchResult?.ratings?.[user?.id];
  const opponentRatingData = opponent ? matchResult?.ratings?.[opponent.id] : null;

  const userOldRating = userRatingData?.old ?? user?.rating ?? 1200;
  const userNewRating = userRatingData?.new ?? (isWinner ? userOldRating + 25 : Math.max(100, userOldRating - 25));
  const userDiff = userRatingData?.diff ?? (userNewRating - userOldRating);
  
  const animatedRating = useCountUp(userNewRating, userOldRating, 1400);

  const currentTier = getTier(userNewRating);
  const prevTier = getTier(userOldRating);
  const isPromotion = userRatingData?.isPromotion ?? (currentTier.name !== prevTier.name && userNewRating > userOldRating);

  const getTitle = () => {
    if (isDraw) return "Match Drawn!";
    if (matchResult?.reason === 'FORFEIT' || matchResult?.reason === 'BAIL_OUT') {
      return isWinner ? "Victory! (Opponent Forfeited)" : "Defeat (You Bailed Out)";
    }
    return isWinner ? "Victory!" : "Defeat";
  };

  const getHeaderColor = () => {
    if (isDraw) return "text-yellow-400 border-yellow-500/30 shadow-yellow-500/30";
    return isWinner 
      ? "text-emerald-400 border-emerald-500/30 shadow-emerald-500/30" 
      : "text-rose-400 border-rose-500/30 shadow-rose-500/30";
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.92, y: 25 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="w-full max-w-2xl bg-card/95 border border-border/60 rounded-3xl overflow-hidden shadow-2xl relative my-auto"
      >
        {/* Ambient Top Glow */}
        <div 
          className={`absolute top-0 left-0 w-full h-40 opacity-15 bg-gradient-to-b ${
            isDraw ? 'from-yellow-500' : isWinner ? 'from-emerald-500' : 'from-rose-500'
          } to-transparent pointer-events-none`} 
        />

        {/* Promotion Banner */}
        <AnimatePresence>
          {isPromotion && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-gradient-to-r from-amber-500/25 via-pink-500/25 to-purple-500/25 border-b border-yellow-500/30 px-6 py-2.5 flex items-center justify-center gap-2 text-center"
            >
              <Sparkles className="w-5 h-5 text-yellow-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="text-xs sm:text-sm font-black tracking-wider uppercase bg-gradient-to-r from-yellow-300 via-amber-200 to-pink-300 bg-clip-text text-transparent">
                Rank Promoted! Welcome to {currentTier.name} Division
              </span>
              <Sparkles className="w-5 h-5 text-pink-400 animate-spin" style={{ animationDuration: '4s' }} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <div className="p-6 sm:p-8 pb-4 flex flex-col items-center relative z-10 text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 14, delay: 0.15 }}
            className={`w-20 h-20 rounded-2xl bg-background/80 border-2 mb-3 flex items-center justify-center shadow-xl ${getHeaderColor()}`}
          >
            {isDraw ? (
              <XCircle className="w-10 h-10 text-yellow-400" />
            ) : isWinner ? (
              <Trophy className="w-10 h-10 text-emerald-400" />
            ) : (
              <Code2 className="w-10 h-10 text-rose-400" />
            )}
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-1 text-foreground">
            {getTitle()}
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">
            Competitive 1v1 Battle Completed
          </p>
        </div>

        {/* Rating Progression Card (LeetCode Style) */}
        <div className="mx-6 sm:mx-8 mb-6 p-5 rounded-2xl bg-secondary/30 border border-border/40 relative overflow-hidden backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-border/30">
            <div className="flex items-center gap-3">
              <TierBadge tier={currentTier} size="lg" showTitle animated />
              <div className="text-left">
                <span className="text-xs text-muted-foreground font-medium block">Current Rank Tier</span>
                <span className="text-sm font-bold text-foreground">{currentTier.name} · {currentTier.title}</span>
              </div>
            </div>

            {/* Elo Ticking Counter */}
            <div className="flex items-baseline gap-2.5">
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground uppercase tracking-wider block font-semibold">Rating</span>
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-foreground">
                  {animatedRating}
                </span>
              </div>

              {/* Delta Badge */}
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, type: 'spring' }}
                className={`flex items-center gap-0.5 px-2.5 py-1 rounded-lg font-mono font-bold text-xs shadow-md ${
                  userDiff >= 0 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {userDiff >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{userDiff >= 0 ? `+${userDiff}` : userDiff}</span>
              </motion.div>
            </div>
          </div>

          {/* Tier Progress Bar */}
          <div className="pt-4">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-muted-foreground font-mono">{currentTier.min}</span>
              <span className="text-foreground/90 font-mono text-[11px]">
                {currentTier.pointsToNext > 0 
                  ? `${currentTier.pointsToNext} pts to ${currentTier.nextTier ? currentTier.nextTier.name : 'Next Rank'}`
                  : 'Apex Rank Achieved'
                }
              </span>
              <span className="text-muted-foreground font-mono">{currentTier.max}+</span>
            </div>
            
            <div className="h-3 w-full bg-background/60 rounded-full overflow-hidden p-0.5 border border-border/40">
              <motion.div
                initial={{ width: `${prevTier.progressPercent}%` }}
                animate={{ width: `${currentTier.progressPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className={`h-full rounded-full bg-gradient-to-r ${currentTier.gradient} shadow-sm`}
              />
            </div>

            {/* Performance & Win Expectancy Insights */}
            {userRatingData?.expectedProb !== undefined && (
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-3 border-t border-border/20">
                <div className="flex items-center gap-1.5">
                  <Zap size={13} className="text-yellow-400" />
                  <span>Win Expectancy: <strong className="text-foreground font-mono">{userRatingData.expectedProb}%</strong></span>
                </div>
                {userRatingData.expectedProb < 45 && isWinner && (
                  <span className="bg-yellow-500/15 text-yellow-400 font-semibold px-2 py-0.5 rounded text-[11px] border border-yellow-500/20">
                    ⚡ Upset Victory Bonus Awarded
                  </span>
                )}
                {userRatingData.expectedProb >= 65 && !isWinner && (
                  <span className="bg-rose-500/15 text-rose-400 font-semibold px-2 py-0.5 rounded text-[11px] border border-rose-500/20">
                    ⚠️ Favored Upset Loss
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Head-to-Head Scoreboard */}
        <div className="px-6 sm:px-8 py-5 bg-black/25 border-y border-border/30 grid grid-cols-3 items-center">
          {/* You */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">You</span>
            <span className="text-3xl sm:text-4xl font-mono font-black text-foreground">{currentScore}</span>
            {userPenalties > 0 && (
              <span className="text-[10px] font-mono text-amber-400 mt-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {userPenalties} pen (-{userPenalties * 5} pts)
              </span>
            )}
            <span className="text-xs text-muted-foreground/80 mt-1 font-mono">
              Rating: {userNewRating}
            </span>
          </div>
          
          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center">
            <div className="text-xs font-black text-muted-foreground/40 px-3 py-1 bg-black/40 rounded-md border border-border/30">
              VS
            </div>
            {matchResult?.reason === 'TIME_EXPIRED' && (
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-1.5">Timeout</span>
            )}
            {(matchResult?.reason === 'FORFEIT' || matchResult?.reason === 'BAIL_OUT') && (
              <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider mt-1.5">Forfeit</span>
            )}
          </div>
          
          {/* Opponent */}
          <div className="flex flex-col items-center text-center">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 truncate max-w-[110px]">
              {opponent?.username || 'Opponent'}
            </span>
            <span className="text-3xl sm:text-4xl font-mono font-black text-foreground">{opponentScore}</span>
            {opponentPenalties > 0 && (
              <span className="text-[10px] font-mono text-amber-400 mt-1 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {opponentPenalties} pen (-{opponentPenalties * 5} pts)
              </span>
            )}
            <span className="text-xs text-muted-foreground/80 mt-1 font-mono">
              Rating: {opponentRatingData?.new ?? opponent?.rating ?? 1200}
              {opponentRatingData?.diff !== undefined && (
                <span className={`ml-1 font-bold ${opponentRatingData.diff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ({opponentRatingData.diff >= 0 ? `+${opponentRatingData.diff}` : opponentRatingData.diff})
                </span>
              )}
            </span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="p-6 flex flex-col sm:flex-row items-center gap-3 justify-center bg-background/50">
          <Button 
            variant="outline"
            className="w-full sm:w-auto min-w-[170px] gap-2"
            onClick={() => {
              useMatchmakingStore.getState().reset();
              navigate('/dashboard');
            }}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Button>

          <Button 
            className="w-full sm:w-auto min-w-[190px] gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 shadow-lg shadow-primary/25"
            onClick={() => {
              useMatchmakingStore.getState().reset();
              navigate('/matchmaking');
            }}
          >
            <RotateCcw size={16} />
            Find Next Match
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
