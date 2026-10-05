import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, X, Loader2, AlertCircle } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { CLIENT_EVENTS, SERVER_EVENTS } from '@/socket/events';

export const OutgoingChallengeModal = ({ challenge, onClose }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [secondsRemaining, setSecondsRemaining] = useState(30);
  const [declinedReason, setDeclinedReason] = useState(null);

  useEffect(() => {
    if (!socket || !challenge) return;

    const handleAccepted = (data) => {
      onClose();
      if (data?.lobbyId) {
        navigate(`/lobby/${encodeURIComponent(data.lobbyId)}`);
      }
    };

    const handleDeclined = (data) => {
      setDeclinedReason(data.reason || 'declined');
      setTimeout(() => {
        onClose();
      }, 2500);
    };

    const handleError = (data) => {
      setDeclinedReason(data.message || 'Challenge failed');
      setTimeout(() => {
        onClose();
      }, 2500);
    };

    socket.on(SERVER_EVENTS.CHALLENGE_ACCEPTED, handleAccepted);
    socket.on(SERVER_EVENTS.CHALLENGE_DECLINED, handleDeclined);
    socket.on(SERVER_EVENTS.ERROR, handleError);

    return () => {
      socket.off(SERVER_EVENTS.CHALLENGE_ACCEPTED, handleAccepted);
      socket.off(SERVER_EVENTS.CHALLENGE_DECLINED, handleDeclined);
      socket.off(SERVER_EVENTS.ERROR, handleError);
    };
  }, [socket, challenge, navigate, onClose]);

  // Countdown timer
  useEffect(() => {
    if (!challenge) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((challenge.expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining <= 0) {
        setDeclinedReason('No response (Timed out)');
        setTimeout(() => onClose(), 2000);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [challenge, onClose]);

  const handleCancel = () => {
    if (!socket || !challenge) return;
    socket.emit(CLIENT_EVENTS.CANCEL_CHALLENGE, {
      challengeId: challenge.challengeId
    });
    onClose();
  };

  if (!challenge || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm rounded-2xl border border-primary/30 bg-neutral-950/95 p-6 shadow-2xl text-center"
        >
          {declinedReason ? (
            <div className="py-4 space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-base font-bold text-white">Challenge Ended</h3>
              <p className="text-xs text-neutral-400">{declinedReason}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Radar Animation */}
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-75" />
                <div className="absolute inset-2 rounded-full border border-primary/30 animate-pulse" />
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-primary shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                  <Swords size={28} className="animate-bounce" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  Challenging {challenge.targetName || 'Friend'}...
                </h3>
                <p className="text-xs text-neutral-400 mt-1">
                  Waiting for response ({secondsRemaining}s remaining)
                </p>
              </div>

              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                />
              </div>

              <button
                onClick={handleCancel}
                className="w-full py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <X size={15} />
                <span>Cancel Challenge</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};
