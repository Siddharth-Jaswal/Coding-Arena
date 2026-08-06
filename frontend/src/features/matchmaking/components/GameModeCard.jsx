import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trophy, Swords, Users } from 'lucide-react';

const icons = {
  Trophy: Trophy,
  Swords: Swords,
  Users: Users,
};

export const GameModeCard = ({ mode, isSelected, onClick }) => {
  const Icon = icons[mode.icon] || Trophy;
  const isAvailable = mode.status === 'Available';

  return (
    <Card 
      onClick={isAvailable ? onClick : undefined}
      className={`border-border/50 bg-card/40 backdrop-blur-sm transition-all duration-200 ${
        isAvailable ? 'cursor-pointer hover:border-primary/50 hover:bg-card/60' : 'opacity-70 cursor-not-allowed'
      } ${isSelected ? 'border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.15)] ring-1 ring-primary' : ''}`}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="h-5 w-5" />
          </div>
          <CardTitle className="text-base">{mode.title}</CardTitle>
        </div>
        <Badge variant={isAvailable ? (isSelected ? 'default' : 'outline') : 'secondary'}>
          {mode.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-xs line-clamp-2 min-h-[32px]">
          {mode.description}
        </CardDescription>
        <div className="mt-4 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
          Est. {mode.estimatedDuration}
        </div>
      </CardContent>
    </Card>
  );
};
