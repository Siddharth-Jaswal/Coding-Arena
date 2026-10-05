import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageWrapper, Container } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/users';
import { Trophy, Swords, Shield, Target, Activity, Award, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeSlideUp, staggerChildren } from '@/lib/motion';
import { TierBadge, getTier } from '@/components/common/TierBadge';

const StatCard = ({ title, value, subtitle, icon: Icon, color = "text-primary", badge }) => (
  <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
    <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-3 sm:gap-4">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <div className={`p-2.5 sm:p-3 rounded-xl bg-background/50 ${color} shrink-0`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-xl sm:text-2xl font-bold">{value}</h4>
            {subtitle && <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">{subtitle}</span>}
          </div>
        </div>
      </div>
      {badge && <div className="shrink-0">{badge}</div>}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: profileResp } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => userApi.getMe(),
  });

  const currentUser = profileResp?.data || user;
  const currentRating = currentUser?.rating || 1500;
  const tierInfo = getTier(currentRating);

  const { data: submissionsResp } = useQuery({
    queryKey: ['user', 'submissions'],
    queryFn: () => userApi.getMySubmissions(5, 0),
  });
  
  const { data: solvedResp } = useQuery({
    queryKey: ['user', 'solved'],
    queryFn: () => userApi.getMySolvedProblems(),
  });

  const recentSubmissions = Array.isArray(submissionsResp?.data)
    ? submissionsResp.data
    : (submissionsResp?.data?.submissions || []);
  const solvedCount = solvedResp?.data?.length ?? currentUser?.problemsSolved ?? 0;

  return (
    <PageWrapper>
      <Container className="py-6 sm:py-8 space-y-6 sm:space-y-8">
        
        {/* Welcome Section */}
        <motion.div {...fadeSlideUp} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Good Evening, {currentUser?.displayName || currentUser?.username}!</h1>
              <TierBadge rating={currentRating} size="md" showTitle={true} animated={true} />
            </div>
            <p className="text-muted-foreground text-sm sm:text-base mt-1.5 sm:mt-2">Welcome back to the Arena. Ready for your next challenge?</p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" className="shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-bold">
              <Link to="/matchmaking">
                <Swords className="w-4 h-4 mr-2" />
                Find 1v1 Battle
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={staggerChildren} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={fadeSlideUp}>
            <StatCard 
              title="Current Rating" 
              value={currentRating} 
              subtitle="Elo"
              icon={Trophy} 
              color="text-yellow-500"
              badge={<TierBadge rating={currentRating} size="sm" showLabel={false} />}
            />
          </motion.div>
          <motion.div variants={fadeSlideUp}>
            <StatCard title="Problems Solved" value={solvedCount} icon={Target} color="text-emerald-500" />
          </motion.div>
          <motion.div variants={fadeSlideUp}>
            <StatCard title="Total Wins" value={currentUser?.wins || 0} icon={Swords} color="text-blue-500" />
          </motion.div>
          <motion.div variants={fadeSlideUp}>
            <StatCard title="Total Losses" value={currentUser?.losses || 0} icon={Shield} color="text-rose-500" />
          </motion.div>
        </motion.div>

        {/* Two Column Layout for Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Submissions */}
          <motion.div {...fadeSlideUp} className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Activity
            </h3>
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
              <div className="divide-y divide-border/50">
                {recentSubmissions.length > 0 ? (
                  recentSubmissions.map((sub) => (
                    <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                      <div>
                        <div className="font-semibold text-sm hover:underline cursor-pointer">
                          {sub.problem?.title || `Problem #${sub.problem_id}`}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {new Date(sub.created_at).toLocaleString()} • {sub.language}
                        </div>
                      </div>
                      <Badge variant={sub.verdict === 'Accepted' ? 'success' : 'destructive'}>
                        {sub.verdict || sub.status}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No recent submissions found. Time to solve your first problem!
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Rank Tier Progression Card */}
          <motion.div {...fadeSlideUp} className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Rank Standing
            </h3>
            
            <Card className="border-border/50 bg-card/40 backdrop-blur-sm overflow-hidden relative">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${tierInfo.gradient}`} />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Tier</span>
                  <TierBadge rating={currentRating} size="sm" showLabel={true} />
                </div>
                <CardTitle className="text-xl font-bold mt-1">
                  {tierInfo.name} <span className="text-sm font-normal text-muted-foreground">· {tierInfo.title}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {tierInfo.nextTier ? (
                    <span>
                      <strong className="text-foreground">{tierInfo.pointsToNext} pts</strong> to {tierInfo.nextTier.name}
                    </span>
                  ) : (
                    <span>Max tier achieved!</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                    <span>{currentRating} pts</span>
                    <span>{tierInfo.nextTier ? `${tierInfo.max + 1} pts` : 'Top'}</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className={`h-full rounded-full bg-gradient-to-r ${tierInfo.gradient}`}
                      style={{ width: `${tierInfo.progressPercent}%` }}
                    />
                  </div>
                </div>

                <Button variant="outline" size="sm" asChild className="w-full text-xs font-semibold border-white/10 hover:bg-white/5">
                  <Link to="/profile" className="flex items-center justify-center gap-1.5">
                    <span>View Rank Breakdown</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/20 backdrop-blur-sm opacity-60">
              <CardHeader className="p-4">
                <CardTitle className="text-base">Global Leaderboard</CardTitle>
                <CardDescription className="text-xs">Compete in PvP matches to climb global rankings.</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

        </div>
      </Container>
    </PageWrapper>
  );
}
