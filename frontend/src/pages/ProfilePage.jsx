import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PageWrapper, Container } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Trophy, Swords, Target, Calendar, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeSlideUp } from '@/lib/motion';

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <PageWrapper>
      <Container className="py-8 max-w-4xl space-y-8">
        
        <motion.div {...fadeSlideUp} className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Column: Avatar & Basic Info */}
          <Card className="w-full md:w-1/3 border-primary/20 shadow-[0_0_40px_-10px_rgba(var(--primary-rgb),0.1)]">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/50 mb-4">
                <User className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">{user?.displayName || user?.username}</h2>
              <p className="text-muted-foreground mb-6">@{user?.username}</p>
              
              <div className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
                <Mail className="h-4 w-4" />
                {user?.email}
              </div>

              <Button variant="outline" className="w-full mb-2">Edit Profile</Button>
              <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={logout}>
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Right Column: Stats & Meta */}
          <div className="w-full md:w-2/3 space-y-6">
            
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
                      <h4 className="text-2xl font-bold">{user?.rating || 1500}</h4>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Target className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Problems Solved</p>
                      <h4 className="text-2xl font-bold">{user?.problemsSolved || 0}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                      <Swords className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                      <h4 className="text-2xl font-bold">{(user?.wins || 0) + (user?.losses || 0) + (user?.draws || 0)}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Member Since</p>
                      <h4 className="text-lg font-bold">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                      </h4>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Coming Soon Features */}
            <motion.div {...fadeSlideUp} className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold text-muted-foreground">More Features Coming Soon</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="border-border/50 bg-card/20 opacity-60">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Achievements</CardTitle>
                    <CardDescription className="text-xs">Collect badges for your milestones.</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="border-border/50 bg-card/20 opacity-60">
                  <CardHeader className="p-4">
                    <CardTitle className="text-base">Match History</CardTitle>
                    <CardDescription className="text-xs">Review your past PvP battles.</CardDescription>
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
