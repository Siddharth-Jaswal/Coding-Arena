import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Swords, 
  Crown, 
  Check, 
  Send, 
  LogOut, 
  Clock, 
  Layers, 
  Trophy, 
  ShieldAlert, 
  Loader2, 
  Sparkles, 
  Flame, 
  Code2,
  Lock,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { CLIENT_EVENTS, SERVER_EVENTS } from '@/socket/events';
import { TierBadge } from '@/components/common/TierBadge';
import { PageWrapper, Container } from '@/components/layout';

const AVAILABLE_TOPICS = [
  { id: 'any', label: 'Any / Mixed' },
  { id: 'arrays', label: 'Arrays' },
  { id: 'strings', label: 'Strings' },
  { id: 'dynamic-programming', label: 'Dynamic Programming' },
  { id: 'graphs', label: 'Graphs' },
  { id: 'trees', label: 'Trees' },
  { id: 'greedy', label: 'Greedy' },
  { id: 'binary-search', label: 'Binary Search' }
];

const TIME_OPTIONS = [10, 15, 20, 25, 30];
const QUESTION_COUNT_OPTIONS = [1, 2, 3];
const DIFFICULTY_OPTIONS = [
  { id: 'any', label: 'Any' },
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' }
];

export const PrivateLobbyPage = () => {
  const { lobbyId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [lobby, setLobby] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [countdown, setCountdown] = useState(null);
  const [isDisbanded, setIsDisbanded] = useState(null);

  const chatBottomRef = useRef(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [lobby?.messages]);

  useEffect(() => {
    if (!socket || !lobbyId) return;

    // Join the lobby room
    socket.emit(CLIENT_EVENTS.JOIN_LOBBY, { lobbyId: decodeURIComponent(lobbyId) });

    const handleLobbyUpdated = (data) => {
      setLobby(data.lobby);
    };

    const handleLobbyDisbanded = (data) => {
      setIsDisbanded(data.reason || 'Lobby closed');
    };

    const handleMatchStarting = (data) => {
      setCountdown(data.countdownSeconds || 3);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate(`/contest/${data.roomId}`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    };

    socket.on(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
    socket.on(SERVER_EVENTS.LOBBY_DISBANDED, handleLobbyDisbanded);
    socket.on(SERVER_EVENTS.LOBBY_MATCH_STARTING, handleMatchStarting);

    return () => {
      socket.off(SERVER_EVENTS.LOBBY_UPDATED, handleLobbyUpdated);
      socket.off(SERVER_EVENTS.LOBBY_DISBANDED, handleLobbyDisbanded);
      socket.off(SERVER_EVENTS.LOBBY_MATCH_STARTING, handleMatchStarting);
    };
  }, [socket, lobbyId, navigate]);

  const isHost = lobby?.creator?.id === user?.id;
  const isGuest = lobby?.guest?.id === user?.id;

  const hostReady = lobby?.ready?.[lobby?.creator?.id];
  const guestReady = lobby?.ready?.[lobby?.guest?.id];
  const bothReady = hostReady && guestReady;

  const handleUpdateSettings = (updates) => {
    if (!isHost || !socket || !lobby) return;
    socket.emit(CLIENT_EVENTS.UPDATE_LOBBY_SETTINGS, {
      lobbyId: lobby.id,
      settings: {
        ...lobby.settings,
        ...updates
      }
    });
  };

  const handleToggleReady = () => {
    if (!socket || !lobby) return;
    socket.emit(CLIENT_EVENTS.TOGGLE_LOBBY_READY, {
      lobbyId: lobby.id
    });
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || !socket || !lobby) return;

    socket.emit(CLIENT_EVENTS.SEND_LOBBY_MESSAGE, {
      lobbyId: lobby.id,
      text: chatInput.trim()
    });
    setChatInput('');
  };

  const handleLeaveLobby = () => {
    if (socket && lobby) {
      socket.emit(CLIENT_EVENTS.LEAVE_LOBBY, { lobbyId: lobby.id });
    }
    navigate('/matchmaking');
  };

  const handleStartMatch = () => {
    if (!isHost || !bothReady || !socket || !lobby) return;
    socket.emit(CLIENT_EVENTS.START_LOBBY_MATCH, {
      lobbyId: lobby.id
    });
  };

  if (isDisbanded) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Lobby Closed</h2>
          <p className="text-sm text-neutral-400 max-w-sm mb-6">{isDisbanded}</p>
          <button
            onClick={() => navigate('/matchmaking')}
            className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold text-xs hover:bg-primary/80 transition-all shadow-lg"
          >
            Back to Matchmaking
          </button>
        </div>
      </PageWrapper>
    );
  }

  if (!lobby) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-neutral-400 gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <span className="text-sm">Connecting to Private Lobby...</span>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Match Starting Countdown Overlay */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <span className="text-xs uppercase tracking-widest text-primary font-bold mb-2 block animate-pulse">
                Generating Problems & Entering Arena
              </span>
              <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-emerald-400">
                {countdown > 0 ? countdown : 'START!'}
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Container className="py-6 max-w-7xl">
        {/* Lobby Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-950/70 border border-white/10 backdrop-blur mb-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20 border border-primary/40 text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Swords size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">Private 1v1 Showdown</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Lobby Active
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Configure your custom match rules and chat before battle
              </p>
            </div>
          </div>

          <button
            onClick={handleLeaveLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 text-neutral-400 hover:text-rose-400 text-xs font-semibold transition-all"
          >
            <LogOut size={13} />
            <span>Leave Lobby</span>
          </button>
        </div>

        {/* Players Showcase Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Host Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            hostReady ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-neutral-950/60 border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {lobby.creator.avatar ? (
                    <img src={lobby.creator.avatar} alt={lobby.creator.username} className="w-12 h-12 rounded-full object-cover border-2 border-primary/50" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 text-primary border-2 border-primary/50 flex items-center justify-center font-bold text-base">
                      {lobby.creator.username[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="absolute -top-1.5 -right-1 p-0.5 rounded-full bg-amber-500 text-neutral-950 shadow-md">
                    <Crown size={12} />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{lobby.creator.username}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      HOST
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <TierBadge rating={lobby.creator.rating} size="sm" />
                    <span className="text-xs text-neutral-400">{lobby.creator.rating} ELO</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  hostReady ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/5 text-neutral-400 border border-white/10'
                }`}>
                  <Check size={12} />
                  <span>Ready</span>
                </span>
              </div>
            </div>
          </div>

          {/* Guest Card */}
          <div className={`p-4 rounded-2xl border transition-all ${
            guestReady ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-neutral-950/60 border-white/10'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {lobby.guest.avatar ? (
                  <img src={lobby.guest.avatar} alt={lobby.guest.username} className="w-12 h-12 rounded-full object-cover border-2 border-white/10" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/5 text-white border-2 border-white/10 flex items-center justify-center font-bold text-base">
                    {lobby.guest.username[0]?.toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{lobby.guest.username}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/10 text-neutral-300 border border-white/10">
                      CHALLENGER
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <TierBadge rating={lobby.guest.rating} size="sm" />
                    <span className="text-xs text-neutral-400">{lobby.guest.rating} ELO</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  guestReady ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 animate-pulse'
                }`}>
                  {guestReady ? <Check size={12} /> : <Clock size={12} />}
                  <span>{guestReady ? 'Ready' : 'Not Ready'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Split: Configurator (Left) & Chat (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Match Configuration (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="p-6 rounded-2xl bg-neutral-950/60 border border-white/10 backdrop-blur shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <Flame size={18} className="text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Match Settings
                  </h3>
                </div>
                {!isHost && (
                  <span className="flex items-center gap-1 text-[11px] text-neutral-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                    <Lock size={11} />
                    <span>Host Controlled</span>
                  </span>
                )}
              </div>

              {/* 1. Ranked vs Unranked Toggle */}
              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Match Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    disabled={!isHost}
                    onClick={() => handleUpdateSettings({ isRanked: false })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      !lobby.settings.isRanked
                        ? 'bg-primary/20 text-primary border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                        : 'bg-white/[0.02] text-neutral-400 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>Unranked (Friendly Scrimmage)</span>
                  </button>

                  <button
                    disabled={!isHost}
                    onClick={() => handleUpdateSettings({ isRanked: true })}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                      lobby.settings.isRanked
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-white/[0.02] text-neutral-400 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    <Trophy size={14} />
                    <span>Ranked (ELO at Stake)</span>
                  </button>
                </div>
              </div>

              {/* 2. Number of Questions */}
              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Problem Count
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {QUESTION_COUNT_OPTIONS.map(cnt => (
                    <button
                      key={cnt}
                      disabled={!isHost}
                      onClick={() => handleUpdateSettings({ questionCount: cnt })}
                      className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                        lobby.settings.questionCount === cnt
                          ? 'bg-white/10 text-white border-white/20 shadow-sm'
                          : 'bg-white/[0.02] text-neutral-400 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      {cnt} {cnt === 1 ? 'Problem' : 'Problems'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Topics Selection */}
              <div>
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                  Topic / Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AVAILABLE_TOPICS.map(t => (
                    <button
                      key={t.id}
                      disabled={!isHost}
                      onClick={() => handleUpdateSettings({ topic: t.id })}
                      className={`p-2 rounded-lg border text-[11px] font-semibold transition-all truncate text-center ${
                        lobby.settings.topic === t.id
                          ? 'bg-primary/20 text-primary border-primary/40 shadow-sm'
                          : 'bg-white/[0.02] text-neutral-400 border-white/5 hover:bg-white/5'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Difficulty & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {DIFFICULTY_OPTIONS.map(d => (
                      <button
                        key={d.id}
                        disabled={!isHost}
                        onClick={() => handleUpdateSettings({ difficulty: d.id })}
                        className={`p-2 rounded-lg border text-xs font-semibold capitalize transition-all ${
                          lobby.settings.difficulty === d.id
                            ? 'bg-white/10 text-white border-white/20 shadow-sm'
                            : 'bg-white/[0.02] text-neutral-400 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
                    Time Per Problem
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {TIME_OPTIONS.slice(0, 3).map(min => (
                      <button
                        key={min}
                        disabled={!isHost}
                        onClick={() => handleUpdateSettings({ timePerQuestion: min })}
                        className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                          lobby.settings.timePerQuestion === min
                            ? 'bg-white/10 text-white border-white/20 shadow-sm'
                            : 'bg-white/[0.02] text-neutral-400 border-white/5 hover:bg-white/5'
                        }`}
                      >
                        {min}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Launch & Ready Bar */}
            <div className="p-4 rounded-2xl bg-neutral-950/70 border border-white/10 backdrop-blur flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-neutral-400">
                {isHost ? (
                  bothReady ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <Zap size={14} /> Both players ready! You can now start the match.
                    </span>
                  ) : (
                    <span>Waiting for challenger to mark Ready...</span>
                  )
                ) : (
                  <span>Click Ready when you are satisfied with the rules.</span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isGuest && (
                  <button
                    onClick={handleToggleReady}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs transition-all ${
                      guestReady
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    }`}
                  >
                    {guestReady ? 'Ready! (Click to cancel)' : 'Mark Ready'}
                  </button>
                )}

                {isHost && (
                  <button
                    onClick={handleStartMatch}
                    disabled={!bothReady}
                    className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      bothReady
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-105'
                        : 'bg-white/5 text-neutral-500 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <Swords size={15} />
                    <span>Launch Match</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Real-time In-Lobby Text Chat (5 cols) */}
          <div className="lg:col-span-5 flex flex-col h-[560px] rounded-2xl bg-neutral-950/70 border border-white/10 backdrop-blur overflow-hidden shadow-xl">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-white/5 bg-neutral-900/60 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Lobby Chat
              </span>
              <span className="text-[11px] text-neutral-500">Live Socket Sync</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {lobby.messages.map((msg) => {
                if (msg.isSystem) {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 text-neutral-400 border border-white/5 inline-block">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isMe = msg.senderId === user?.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-neutral-500 mb-0.5 px-1">
                      {msg.senderName}
                    </span>
                    <div
                      className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                        isMe
                          ? 'bg-primary text-white rounded-br-none shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                          : 'bg-white/10 text-neutral-200 rounded-bl-none border border-white/5'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-white/5 bg-neutral-900/40 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type a message to your friend..."
                className="flex-1 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-primary/50 transition-all font-medium"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="p-2 rounded-xl bg-primary hover:bg-primary/80 disabled:opacity-40 text-white transition-all shadow-md shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </Container>
    </PageWrapper>
  );
};
