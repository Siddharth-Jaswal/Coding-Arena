import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/users';
import { PageWrapper, Container } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Trophy, Swords, Target, Calendar, Mail, Zap, ChevronRight, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeSlideUp } from '@/lib/motion';
import { TierBadge, TIERS, getTier } from '@/components/common/TierBadge';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const { data: profileResp } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userApi.getMe(),
  });

  const { data: solvedResp } = useQuery({
    queryKey: ['user', 'solved'],
    queryFn: () => userApi.getMySolvedProblems(),
  });

  const currentUser = profileResp?.data || user;
  const currentRating = currentUser?.rating || 1500;
  const tierInfo = getTier(currentRating);
  const problemsSolved = solvedResp?.data?.length ?? currentUser?.problemsSolved ?? 0;

  return (
    <PageWrapper>
      <Container className="py-8 max-w-4xl space-y-8">
        
        <motion.div {...fadeSlideUp} className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Column: Avatar & Basic Info */}
          <Card className="w-full md:w-1/3 border-primary/20 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.1)]">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-28 h-28 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/50 shadow-inner">
                  <User className="w-14 h-14 text-primary" />
                </div>
              </div>

              <h2 className="text-2xl font-bold tracking-tight">{currentUser?.displayName || currentUser?.username}</h2>
              <p className="text-muted-foreground text-sm mb-4">@{currentUser?.username}</p>
              
              {/* Prominent Tier Badge */}
              <div className="mb-6 flex flex-col items-center gap-1.5">
                <TierBadge rating={currentRating} size="lg" showTitle={true} animated={true} />
                <span className="text-[11px] font-mono text-muted-foreground">
                  Current Elo: <strong className="text-foreground">{currentRating}</strong>
                </span>
              </div>

              <div className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground mb-6 bg-white/5 py-2 px-3 rounded-lg border border-white/5 truncate">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{currentUser?.email}</span>
              </div>

              <Button variant="outline" className="w-full mb-2">Edit Profile</Button>
              <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Right Column: Stats & Meta */}
          <div className="w-full md:w-2/3 space-y-6">
            
            {/* Tier Progression Card */}
            <motion.div {...fadeSlideUp}>
              <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden relative">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tierInfo.gradient}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      Rank Tier Progression
                    </CardTitle>
                    <TierBadge rating={currentRating} size="sm" showLabel={true} />
                  </div>
                  <CardDescription>
                    {tierInfo.nextTier ? (
                      <span>
                        <strong className="text-foreground font-semibold">{tierInfo.pointsToNext} pts</strong> needed to reach{' '}
                        <span className="font-semibold" style={{ color: tierInfo.nextTier.color }}>
                          {tierInfo.nextTier.name} ({tierInfo.nextTier.title})
                        </span>
                      </span>
                    ) : (
                      <span>You have reached the maximum competitive tier. Master of the Arena!</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                      <span>{tierInfo.min} pts</span>
                      <span className="font-bold text-foreground">{tierInfo.progressPercent}% Completed</span>
                      <span>{tierInfo.max === 3000 ? '2100+' : `${tierInfo.max} pts`}</span>
                    </div>
                    <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-0.5">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${tierInfo.progressPercent}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${tierInfo.gradient}`}
                      />
                    </div>
                  </div>

                  {/* All Competitive Tiers Preview */}
                  <div className="pt-2 border-t border-border/40">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
                      All Arena Tiers
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {TIERS.map((t) => {
                        const isCurrent = t.id === tierInfo.id;
                        return (
                          <div 
                            key={t.id}
                            className={`p-2 rounded-xl border text-center transition-all ${
                              isCurrent 
                                ? `${t.bg} ${t.border} shadow-sm ring-1 ring-white/20` 
                                : 'bg-white/[0.02] border-white/5 opacity-60'
                            }`}
                          >
                            <span className="text-[10px] uppercase font-bold block" style={{ color: t.color }}>
                              {t.name}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-mono block mt-0.5">
                              {t.min} - {t.max === 3000 ? '2100+' : t.max}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Competitive Overview */}
            <motion.div {...fadeSlideUp}>
              <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Competitive Overview</CardTitle>
                  <CardDescription>Your performance statistics in the Arena</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Global Rating</p>
                      <h4 className="text-2xl font-bold">{currentRating}</h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                      <h4 className="text-2xl font-bold">{problemsSolved}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                      <Swords className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                      <h4 className="text-2xl font-bold">{(currentUser?.wins || 0) + (currentUser?.losses || 0) + (currentUser?.draws || 0)}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <h4 className="text-lg font-bold">
                        {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'Recently'}
                      </h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Match History & Achievements Link */}
            <motion.div {...fadeSlideUp} className="space-y-4 pt-2">
              <h3 className="text-lg font-semibold text-muted-foreground">Activity & History</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-border/50 bg-card/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Recent 1v1 Battles</span>
                      <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2 text-primary">
                        <a href="/matchmaking">Battle Now</a>
                      </Button>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Wins: <strong className="text-emerald-400">{currentUser?.wins || 0}</strong> • Losses: <strong className="text-rose-400">{currentUser?.losses || 0}</strong> • Draws: <strong className="text-yellow-400">{currentUser?.draws || 0}</strong>
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-border/50 bg-card/20 hover:border-primary/40 transition-colors">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span>Highest Elo Achieved</span>
                      <Zap className="w-4 h-4 text-amber-400" />
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Peak Rating: <strong className="text-foreground font-mono">{currentUser?.maxRating || currentRating} pts</strong>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </motion.div>

          </div>

        </motion.div>
      </Container>
    </PageWrapper>
  );
}
