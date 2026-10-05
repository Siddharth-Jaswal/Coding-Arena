import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Wifi, WifiOff, Flag, AlertTriangle } from 'lucide-react';
import { ContestTimer } from '@/components/common/ContestTimer';
import { useSocket } from '@/contexts/SocketContext';
import { useMatchContext } from '../contexts/MatchContext';

export const ContestHeader = ({ room, status, endsAt }) => {
  const { roomId: urlRoomId } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useSocket();
  const { bailOut } = useMatchContext();
  const [showBailModal, setShowBailModal] = useState(false);

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

  const modeTitle = room?.mode === 'toss' 
    ? 'Toss Battle' 
    : room?.mode === 'casual' 
      ? '1v1 Friendly Showdown' 
      : 'Ranked Battle';

  const displayRoomId = (room?.roomId || urlRoomId || '').replace(/^room:/, '').slice(0, 8);

  return (
    <header className="h-14 border-b border-border/50 bg-[#050505] flex items-center justify-between px-4 sm:px-6 relative z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
          {modeTitle}
        </h1>
        <div className="hidden sm:flex items-center gap-2">
          {getStatusBadge()}
          {displayRoomId && (
            <span className="text-xs text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded">
              #{displayRoomId}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {status === 'running' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ContestTimer endsAt={endsAt} />
          </motion.div>
        )}

        {status !== 'finished' && (
          <button
            onClick={() => setShowBailModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35 text-red-400 border border-red-500/40 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
            title={status === 'waiting' ? 'Leave waiting room without penalty' : 'Bail out of match (forfeit)'}
          >
            <Flag size={13} />
            <span>{status === 'waiting' ? 'Leave Room' : 'Bail Out'}</span>
          </button>
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

      {/* Bail Out Confirmation Modal (Portalled to document.body) */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showBailModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#12121c] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4 text-red-400">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {status === 'waiting' ? 'Leave Waiting Room?' : 'Bail Out of Match?'}
                </h3>
                <p className="text-sm text-neutral-400 mb-6 leading-relaxed">
                  {status === 'waiting'
                    ? 'The match has not started yet. Leaving now will safely return you to matchmaking without any rating penalties.'
                    : 'Bailing out will immediately forfeit the match. Your opponent will be awarded the victory and your rating will decrease.'}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowBailModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-neutral-300 transition-colors"
                  >
                    Stay in Arena
                  </button>
                  <button
                    onClick={() => {
                      setShowBailModal(false);
                      bailOut();
                      if (status === 'waiting') {
                        navigate('/matchmaking');
                      }
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
                  >
                    {status === 'waiting' ? 'Yes, Leave Room' : 'Yes, Bail Out (Forfeit)'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};
