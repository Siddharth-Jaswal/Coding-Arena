import React from "react";
import { Card, CardContent } from "../ui/Card";

export const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <Card variant="glass" className="relative overflow-hidden">
      <CardContent className="p-6 flex items-center gap-4">
        {Icon && (
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <Icon size={24} />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-3xl font-bold tracking-tight text-foreground">{value}</h4>
            {trend && (
              <span className={`text-xs font-medium ${trend > 0 ? 'text-success' : 'text-destructive'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
      {/* Decorative gradient blur in corner */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
    </Card>
  );
};
