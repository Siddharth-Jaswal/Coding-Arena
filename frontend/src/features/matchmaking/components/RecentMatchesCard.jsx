import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/users';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { History, Trophy, Swords, XCircle, Minus, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { getTier } from '@/features/contest/constants/tiers';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Recent';
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  const days = Math.floor(diffSec / 86400);
  if (days < 7) return `${days}d ago`;
  return past.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const RecentMatchesCard = () => {
  const { data: matchesResp, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['user', 'matches'],
    queryFn: () => userApi.getMyMatches(8),
  });

  const matches = matchesResp?.data?.data || matchesResp?.data || [];

  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recent Matches
          {matches.length > 0 && (
            <span className="text-xs bg-primary/10 text-primary font-mono font-bold px-2 py-0.5 rounded-full ml-1">
              {matches.length}
            </span>
          )}
        </CardTitle>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-white/5 disabled:opacity-50"
          title="Refresh match history"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin text-primary' : ''}`} />
        </button>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="space-y-3 py-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 flex-1">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Swords className="h-8 w-8 text-primary/70" />
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1">No Matches Played Yet</h4>
            <p className="text-xs text-muted-foreground max-w-xs">
              Complete your first 1v1 battle to build your competitive history. Matches and rating progression will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 overflow-y-auto max-h-[380px] pr-1">
            {matches.map((m) => {
              const oppTier = getTier(m.opponent?.rating || 1200);
              const reasonLabel = {
                ALL_PROBLEMS_SOLVED: 'All Solved',
                TIME_EXPIRED: 'Timeout',
                FORFEIT: 'Forfeit',
                BAIL_OUT: 'Forfeit'
              }[m.finishReason] || 'Completed';

              return (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-background/50 border border-border/40 hover:border-border/80 transition-all gap-3"
                >
                  {/* Left: Result pill + Opponent info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold border ${
                        m.isDraw
                          ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-400'
                          : m.isWinner
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {m.isDraw ? (
                        <Minus size={18} />
                      ) : m.isWinner ? (
                        <Trophy size={17} />
                      ) : (
                        <XCircle size={17} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-foreground">
                          vs {m.opponent?.username || 'Opponent'}
                        </span>
                        <span 
                          className="text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider"
                          style={{ color: oppTier.color, backgroundColor: `${oppTier.color}15` }}
                        >
                          {oppTier.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="font-mono text-[11px]">
                          Score: <strong className="text-foreground">{m.userScore}</strong> - {m.opponentScore}
                        </span>
                        <span>•</span>
                        <span className="text-[11px]">{reasonLabel}</span>
                        <span>•</span>
                        <span className="text-[11px]">{formatRelativeTime(m.finishedAt || m.startedAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Rating Delta */}
                  {m.ratingDiff !== null && (
                    <div className="shrink-0 text-right">
                      <div
                        className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-mono text-xs font-bold ${
                          m.ratingDiff > 0
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : m.ratingDiff < 0
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-muted/40 text-muted-foreground border border-border/40'
                        }`}
                      >
                        {m.ratingDiff > 0 ? (
                          <ArrowUpRight size={13} />
                        ) : m.ratingDiff < 0 ? (
                          <ArrowDownRight size={13} />
                        ) : null}
                        <span>{m.ratingDiff > 0 ? `+${m.ratingDiff}` : m.ratingDiff}</span>
                      </div>
                      {m.newRating && (
                        <span className="block text-[10px] font-mono text-muted-foreground mt-0.5">
                          {m.newRating} pts
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
