import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff } from 'lucide-react';
import { ContestTimer } from '@/components/common/ContestTimer';
import { useSocket } from '@/contexts/SocketContext';

export const ContestHeader = ({ room, status, endsAt }) => {
  const { isConnected } = useSocket();

  const getStatusBadge = () => {
    switch (status) {
      case 'waiting':
        return <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-xs uppercase font-bold tracking-wider">Waiting for Opponent</span>;
      case 'countdown':
        return <span className="px-2 py-0.5 bg-blue-500/20 text-blue-500 rounded text-xs uppercase font-bold tracking-wider">Get Ready</span>;
      case 'running':
        return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded text-xs uppercase font-bold tracking-wider">Live</span>;
      case 'finished':
        return <span className="px-2 py-0.5 bg-muted/20 text-muted-foreground rounded text-xs uppercase font-bold tracking-wider">Finished</span>;
      default:
        return null;
    }
  };

  return (
    <header className="h-14 border-b border-border/50 bg-[#050505] flex items-center justify-between px-4 sm:px-6 relative z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          Ranked Match
        </h1>
        <div className="hidden sm:flex items-center gap-2">
          {getStatusBadge()}
          <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded">
            {room?.roomId || 'Loading...'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {status === 'running' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ContestTimer endsAt={endsAt} />
          </motion.div>
        )}
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isConnected ? (
            <>
              <Wifi size={14} className="text-emerald-500" />
              <span className="hidden sm:inline">Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={14} className="text-red-500" />
              <span className="hidden sm:inline text-red-500">Offline</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
