import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, Users, Clock, Info } from 'lucide-react';
import { Badge } from "@/components/ui/Badge";

export const ArenaHeader = ({ problem, isLoading }) => {
  return (
    <header className="h-14 border-b border-border/50 bg-background/50 backdrop-blur-xl flex items-center justify-between px-4 z-40 relative">
      <div className="flex items-center gap-4">
        <Link to="/problems" className="p-2 hover:bg-white/5 rounded-md transition-colors text-muted-foreground hover:text-foreground">
          <ChevronLeft size={20} />
        </Link>
        <div className="flex flex-col">
          {isLoading ? (
            <div className="h-5 w-48 bg-white/5 rounded animate-pulse" />
          ) : (
            <div className="flex items-center gap-3">
              <span className="font-semibold">{problem?.title || 'Loading Problem...'}</span>
              {problem?.difficulty && (
                <Badge variant={problem.difficulty.toLowerCase() === 'easy' ? 'success' : problem.difficulty.toLowerCase() === 'medium' ? 'warning' : 'destructive'} className="scale-75 origin-left">
                  {problem.difficulty}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reserved space for future multiplayer / match info */}
      <div className="flex items-center gap-3 opacity-30 pointer-events-none">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
          <Clock size={14} className="text-primary" />
          00:00:00
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
          <Users size={14} className="text-secondary" />
          <span className="text-xs">Match Info</span>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
          <Info size={14} className="text-accent" />
          <span className="text-xs">Opponent</span>
        </div>
      </div>
    </header>
  );
};
