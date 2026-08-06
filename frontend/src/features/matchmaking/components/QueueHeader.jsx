import React from 'react';
import { motion } from 'framer-motion';
import { fadeSlideUp } from '@/lib/motion';
import { Badge } from '@/components/ui/Badge';
import { Globe, Users, Trophy, Activity } from 'lucide-react';

export const QueueHeader = () => {
  return (
    <motion.div {...fadeSlideUp} className="flex flex-wrap items-center justify-center gap-4 mb-8">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card/40 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-full">
        <Globe className="h-4 w-4 text-blue-500" />
        US-East
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card/40 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-full">
        <Users className="h-4 w-4 text-emerald-500" />
        1,428 Searching
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card/40 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-full">
        <Trophy className="h-4 w-4 text-yellow-500" />
        Season 4
      </div>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-card/40 backdrop-blur-sm border border-border/50 px-4 py-2 rounded-full">
        <Activity className="h-4 w-4 text-primary" />
        Servers Online
      </div>
    </motion.div>
  );
};
