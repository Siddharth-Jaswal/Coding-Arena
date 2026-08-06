import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MATCHMAKING_RULES } from '../constants/matchmaking.constants';
import { ShieldAlert } from 'lucide-react';

export const MatchmakingRules = () => {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Rules of Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {MATCHMAKING_RULES.map((rule, idx) => (
            <li key={idx} className="flex gap-3 text-sm">
              <span className="text-primary font-bold">{idx + 1}.</span>
              <div>
                <span className="font-semibold text-foreground block mb-0.5">{rule.title}</span>
                <span className="text-muted-foreground">{rule.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
