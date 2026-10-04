import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudLightning, CheckCircle2, Loader2, X } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';

export const ServerWarmupBanner = () => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'waking' | 'ready' | 'dismissed'
  const hasMounted = useRef(false);
  const { isConnected } = useSocket() || {};

  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Detect whether we are in production
  const rawMode = (import.meta.env.VITE_APP_MODE || import.meta.env.MODE || (import.meta.env.PROD ? 'prod' : 'local')).toLowerCase();
  const isProd = !isLocalhost || rawMode === 'prod' || rawMode === 'production';

  const rawApiBase = isProd 
    ? (import.meta.env.VITE_PROD_API_URL || import.meta.env.VITE_API_URL || '')
    : (import.meta.env.VITE_LOCAL_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000');

  const rawWorkerBase = isProd 
    ? (import.meta.env.VITE_PROD_WORKER_URL || import.meta.env.VITE_WORKER_URL || '')
    : (import.meta.env.VITE_LOCAL_WORKER_URL || import.meta.env.VITE_WORKER_URL || '');

  const apiBase = rawApiBase ? rawApiBase.replace(/\/+$/, '') : '';
  const workerBase = rawWorkerBase ? rawWorkerBase.replace(/\/+$/, '') : '';

  // Check if user already dismissed this session
  useEffect(() => {
    try {
      if (sessionStorage.getItem('warmup_banner_dismissed') === 'true') {
        setStatus('dismissed');
      }
    } catch {
      // Ignore sessionStorage issues
    }
  }, []);

  // If Socket is connected, the backend server is 100% awake and reachable!
  useEffect(() => {
    if (isConnected && status !== 'dismissed') {
      setStatus((prev) => {
        if (prev === 'waking') {
          setTimeout(() => setStatus('dismissed'), 2000);
          return 'ready';
        }
        return 'dismissed';
      });
    }
  }, [isConnected, status]);

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('warmup_banner_dismissed', 'true');
    } catch {
      // Ignore
    }
    setStatus('dismissed');
  };

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    // Do not run warmup checks if on localhost
    if (isLocalhost && !isProd) {
      setStatus('dismissed');
      return;
    }

    let isSubscribed = true;
    let timer = null;
    let wakeTimer = null;

    // Only display "waking" banner if server takes longer than 2.5 seconds to respond
    wakeTimer = setTimeout(() => {
      if (isSubscribed && status === 'idle' && !isConnected) {
        setStatus('waking');
      }
    }, 2500);

    const pingServices = async () => {
      // If socket already connected, dismiss immediately
      if (isConnected) {
        if (isSubscribed) setStatus('dismissed');
        return;
      }

      let apiOk = false;

      // 1. Ping API health check
      if (apiBase) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(`${apiBase}/health`, { 
            method: 'GET',
            mode: 'cors',
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
          if (res.ok) apiOk = true;
        } catch {
          apiOk = false;
        }
      } else {
        // No explicit API base URL configured, assume online
        apiOk = true;
      }

      // 2. Wake worker in background if URL configured (fire-and-forget, non-blocking)
      if (workerBase) {
        try {
          const workerController = new AbortController();
          const workerTimeout = setTimeout(() => workerController.abort(), 5000);
          fetch(`${workerBase}/`, { method: 'GET', signal: workerController.signal })
            .finally(() => clearTimeout(workerTimeout));
        } catch {
          // Non-blocking
        }
      }

      if (!isSubscribed) return;

      if (apiOk) {
        clearTimeout(wakeTimer);
        setStatus((prev) => {
          if (prev === 'waking') {
            setTimeout(() => {
              if (isSubscribed) setStatus('dismissed');
            }, 2500);
            return 'ready';
          }
          return 'dismissed';
        });
      } else {
        // Server still sleeping, keep retrying
        setStatus((prev) => (prev === 'dismissed' ? 'dismissed' : 'waking'));
        timer = setTimeout(pingServices, 4000);
      }
    };

    pingServices();

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
      clearTimeout(wakeTimer);
    };
  }, [apiBase, workerBase, isLocalhost, isProd, isConnected]);

  if (status === 'idle' || status === 'dismissed') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[999] max-w-sm w-[calc(100vw-2.5rem)] sm:w-auto"
      >
        <div className="bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl p-3.5 sm:p-4 flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            status === 'ready' 
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
          }`}>
            {status === 'ready' ? (
              <CheckCircle2 size={18} />
            ) : (
              <CloudLightning size={18} className="animate-pulse" />
            )}
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-foreground">
                {status === 'ready' ? 'Cloud Services Online' : 'Waking Up Cloud Services'}
              </h4>
              <div className="flex items-center gap-1.5 shrink-0">
                {status === 'waking' && (
                  <Loader2 size={13} className="text-amber-400 animate-spin" />
                )}
                <button
                  onClick={handleDismiss}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                  title="Dismiss"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {status === 'ready' 
                ? 'All servers are awake and connected.'
                : 'Render free tier spins down on idle. Warming up API (~30s)...'}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
