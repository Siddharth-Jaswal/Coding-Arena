import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const MatchEventFeed = ({ events = [] }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  const renderEvent = (event, index) => {
    const date = new Date(event.timestamp || Date.now());
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    let colorClass = 'text-muted-foreground';
    if (event.type === 'system') colorClass = 'text-primary/80';
    if (event.type === 'solve' && event.user === 'me') colorClass = 'text-emerald-500';
    if (event.type === 'solve' && event.user === 'opponent') colorClass = 'text-red-400';

    return (
      <motion.div 
        key={index} 
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex gap-3 text-xs font-mono leading-relaxed group"
      >
        <span className="text-white/30 shrink-0">[{time}]</span>
        <span className={`${colorClass} break-words`}>{event.message}</span>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col bg-card/40 border border-border/50 rounded-xl h-64 overflow-hidden backdrop-blur-sm">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-black/20">
        <Terminal size={14} className="text-muted-foreground" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Event Feed
        </span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {events.length === 0 ? (
          <div className="text-xs text-muted-foreground/50 font-mono italic">
            Waiting for events...
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map(renderEvent)}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
