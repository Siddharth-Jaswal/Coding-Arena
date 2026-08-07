import React from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const difficultyColors = {
  easy: 'bg-emerald-500',
  medium: 'bg-amber-500',
  hard: 'bg-rose-500'
};

export const ProblemNavigator = ({
  problems = [],
  activeProblemId,
  onProblemChange,
  solvedProblemIds = [],
  attemptedProblemIds = [],
  disabled = false
}) => {
  return (
    <div className="flex flex-col w-20 bg-card/40 border-r border-border/50 h-full backdrop-blur-md">
      <div className="p-4 border-b border-border/50 flex justify-center">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Nav
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 flex flex-col items-center">
        {problems.map((problem, index) => {
          const isActive = problem.id === activeProblemId;
          const isSolved = solvedProblemIds.includes(problem.id);
          const isAttempted = attemptedProblemIds.includes(problem.id);
          const letter = String.fromCharCode(65 + index); // A, B, C...
          const difficultyColor = difficultyColors[problem.difficulty?.toLowerCase()] || 'bg-slate-500';

          return (
            <button
              key={problem.id}
              onClick={() => {
                if (!disabled) onProblemChange(problem.id);
              }}
              disabled={disabled}
              title={`${letter}: ${problem.title} (${problem.difficulty})`}
              className={cn(
                "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300",
                isActive 
                  ? "bg-primary/20 text-primary-foreground border border-primary/30 shadow-glow-primary/20" 
                  : "hover:bg-white/5 text-muted-foreground border border-transparent",
                disabled && !isActive && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Problem Letter */}
              <span className={cn(
                "font-bold text-lg",
                isActive ? "text-primary-foreground" : "text-white/70"
              )}>
                {letter}
              </span>

              {/* Status Icon Overlay */}
              <div className="absolute -top-1 -right-1 bg-background rounded-full">
                {isSolved ? (
                  <CheckCircle2 size={16} className="text-emerald-500 drop-shadow-md" />
                ) : isAttempted ? (
                  <AlertCircle size={16} className="text-amber-500 drop-shadow-md" />
                ) : (
                  <Circle size={16} className="text-white/20" />
                )}
              </div>

              {/* Difficulty Dot Indicator */}
              <div 
                className={cn(
                  "absolute -bottom-1 w-3 h-3 rounded-full border-2 border-background",
                  difficultyColor
                )} 
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
