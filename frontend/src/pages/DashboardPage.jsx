import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageWrapper, Container } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/api/users';
import { Trophy, Swords, Shield, Target, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeSlideUp, staggerChildren } from '@/lib/motion';

const StatCard = ({ title, value, icon: Icon, color = "text-primary" }) => (
  <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
    <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4">
      <div className={`p-2.5 sm:p-3 rounded-xl bg-background/50 ${color} shrink-0`}>
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
        <h4 className="text-xl sm:text-2xl font-bold">{value}</h4>
      </div>
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
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Good Evening, {currentUser?.displayName || currentUser?.username}!</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1.5 sm:mt-2">Welcome back to the Arena. Ready for your next challenge?</p>
          </div>
          <div className="flex gap-3">
            <Button asChild size="lg" className="shadow-lg shadow-primary/20">
              <Link to="/problems">Continue Solving</Link>
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={staggerChildren} initial="hidden" animate="show" className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div variants={fadeSlideUp}>
            <StatCard title="Current Rating" value={currentUser?.rating || 1500} icon={Trophy} color="text-yellow-500" />
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
                        <Link to={`/problems/${sub.problem_id}`} className="font-medium hover:text-primary transition-colors">
                          {sub.problems?.title || `Problem #${sub.problem_id}`}
                        </Link>
                        <div className="text-xs text-muted-foreground mt-1">
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

          {/* Placeholders for Future Features */}
          <motion.div {...fadeSlideUp} className="space-y-4">
            <h3 className="text-xl font-semibold text-muted-foreground">Coming Soon</h3>
            
            <Card className="border-border/50 bg-card/20 backdrop-blur-sm opacity-60">
              <CardHeader>
                <CardTitle className="text-lg">Matchmaking</CardTitle>
                <CardDescription>Challenge players of similar skill rating in real-time battles.</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/20 backdrop-blur-sm opacity-60">
              <CardHeader>
                <CardTitle className="text-lg">Global Leaderboard</CardTitle>
                <CardDescription>See how you rank against the best competitive programmers.</CardDescription>
              </CardHeader>
            </Card>
          </motion.div>

        </div>
      </Container>
    </PageWrapper>
  );
}
