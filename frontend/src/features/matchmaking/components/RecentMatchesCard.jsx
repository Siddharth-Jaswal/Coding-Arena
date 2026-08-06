import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { History } from 'lucide-react';

export const RecentMatchesCard = () => {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Recent Matches
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center py-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <History className="h-8 w-8 text-primary opacity-50" />
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          Complete your first battle to build your multiplayer history. Matches will appear here automatically.
        </p>
      </CardContent>
    </Card>
  );
};
