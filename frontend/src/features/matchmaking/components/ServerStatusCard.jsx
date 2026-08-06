import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Activity, Server } from 'lucide-react';

export const ServerStatusCard = () => {
  const services = [
    { name: 'Matchmaking Service', status: 'Operational', ping: '12ms' },
    { name: 'Contest Sockets', status: 'Operational', ping: '15ms' },
    { name: 'Code Judge Cluster', status: 'Under Load', ping: '45ms', warning: true },
    { name: 'Redis Cache', status: 'Operational', ping: '4ms' },
  ];

  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="h-5 w-5 text-primary" />
          Server Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${service.warning ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                <span className="text-sm font-medium">{service.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className={service.warning ? 'text-yellow-500' : 'text-emerald-500'}>{service.status}</span>
                <span className="text-muted-foreground tabular-nums w-10 text-right">{service.ping}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
