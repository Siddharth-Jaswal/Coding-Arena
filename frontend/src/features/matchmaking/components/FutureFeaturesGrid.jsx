import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { FUTURE_FEATURES } from '../constants/matchmaking.constants';
import { Sparkles } from 'lucide-react';

export const FutureFeaturesGrid = () => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground px-1">
        <Sparkles className="h-5 w-5" />
        Coming Soon to Arena
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {FUTURE_FEATURES.map((feature, idx) => (
          <Card key={idx} className="border-border/50 bg-card/20 backdrop-blur-sm opacity-60">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-semibold">{feature.title}</CardTitle>
              <CardDescription className="text-xs">{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
