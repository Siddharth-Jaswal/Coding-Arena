import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { TIMELINE_STAGES } from '../constants/matchmaking.constants';
import { MATCHMAKING_STATES } from '../constants/matchmaking.constants';

export const QueueTimeline = ({ status }) => {
  // Determine current active index based on status
  let activeIndex = 0;
  if (status === MATCHMAKING_STATES.QUEUED || status === MATCHMAKING_STATES.JOINING) activeIndex = 1;
  if (status === MATCHMAKING_STATES.MATCH_FOUND) activeIndex = 2;
  if (status === MATCHMAKING_STATES.ACCEPTED) activeIndex = 3;

  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Matchmaking Sequence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Vertical Line connecting steps */}
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border/50" />
          
          <div className="space-y-6">
            {TIMELINE_STAGES.map((stage, index) => {
              const isCompleted = index < activeIndex;
              const isActive = index === activeIndex;
              const isPending = index > activeIndex;

              return (
                <div key={stage.id} className="relative flex items-start gap-4">
                  <div className="relative z-10 flex h-8 w-8 items-center justify-center bg-background rounded-full">
                    {isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    ) : isActive ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 pt-1">
                    <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {stage.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stage.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
