import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BarChart3 } from 'lucide-react';

export const QueueStatistics = () => {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Queue Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Avg Wait</p>
            <p className="text-xl font-bold text-foreground">1m 12s</p>
          </div>
          <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">In Queue</p>
            <p className="text-xl font-bold text-foreground">248</p>
          </div>
          <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Active Matches</p>
            <p className="text-xl font-bold text-foreground">1,092</p>
          </div>
          <div className="p-4 rounded-xl bg-background/50 border border-border/50 text-center">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Peak Rating</p>
            <p className="text-xl font-bold text-foreground text-yellow-500">2840</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
