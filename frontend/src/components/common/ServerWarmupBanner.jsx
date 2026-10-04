import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudLightning, CheckCircle2, Loader2 } from 'lucide-react';

export const ServerWarmupBanner = () => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'waking' | 'ready' | 'dismissed'
  const [servicesStatus, setServicesStatus] = useState({ api: 'checking', worker: 'checking' });
  const hasMounted = useRef(false);

  const rawMode = (import.meta.env.VITE_APP_MODE || import.meta.env.MODE || (import.meta.env.PROD ? 'prod' : 'local')).toLowerCase();
  const isProdMode = rawMode === 'prod' || rawMode === 'production';

  const apiBase = isProdMode 
    ? (import.meta.env.VITE_PROD_API_URL || import.meta.env.VITE_API_URL || '')
    : (import.meta.env.VITE_LOCAL_API_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000');

  const workerBase = isProdMode 
    ? (import.meta.env.VITE_PROD_WORKER_URL || import.meta.env.VITE_WORKER_URL || '')
    : (import.meta.env.VITE_LOCAL_WORKER_URL || import.meta.env.VITE_WORKER_URL || '');

  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    let isSubscribed = true;
    let timer = null;
    let wakeTimer = null;

    // If initial ping takes longer than 2.2 seconds, Render is spinning up
    wakeTimer = setTimeout(() => {
      if (isSubscribed && status === 'idle') {
        setStatus('waking');
      }
    }, 2200);

    const pingServices = async () => {
      let apiOk = false;
      let workerOk = !workerBase; // true if no worker URL configured

      // 1. Ping API
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        const res = await fetch(`${apiBase}/health`, { 
          method: 'GET',
          signal: controller.signal 
        });
        clearTimeout(timeoutId);
        if (res.ok) apiOk = true;
      } catch (e) {
        apiOk = false;
      }

      // 2. Ping Worker if URL provided
      if (workerBase) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(`${workerBase}/`, { 
            method: 'GET',
            signal: controller.signal 
          });
          clearTimeout(timeoutId);
          if (res.ok) workerOk = true;
        } catch (e) {
          workerOk = false;
        }
      }

      if (!isSubscribed) return;

      setServicesStatus({
        api: apiOk ? 'ready' : 'waking',
        worker: workerOk ? 'ready' : 'waking'
      });

      if (apiOk && workerOk) {
        clearTimeout(wakeTimer);
        setStatus((prev) => {
          if (prev === 'waking') {
            // Show ready badge briefly before dismiss
            setTimeout(() => {
              if (isSubscribed) setStatus('dismissed');
            }, 3500);
            return 'ready';
          }
          return 'dismissed';
        });
      } else {
        // Keep retrying while servers are warming up
        setStatus('waking');
        timer = setTimeout(pingServices, 4000);
      }
    };

    pingServices();

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
      clearTimeout(wakeTimer);
    };
  }, [apiBase, workerBase]);

  if (status === 'idle' || status === 'dismissed') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="fixed bottom-5 right-5 z-[999] max-w-sm"
      >
        <div className="bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl rounded-2xl p-4 flex items-start gap-3">
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
              {status === 'waking' && (
                <Loader2 size={13} className="text-amber-400 animate-spin shrink-0" />
              )}
            </div>

            <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
              {status === 'ready' 
                ? 'All servers are awake and connected.'
                : 'Render free tier spins down on idle. Warming up API & judge worker (~30s)...'}
            </p>

            {status === 'waking' && workerBase && (
              <div className="flex items-center gap-3 mt-2 text-[10px] font-mono">
                <span className={servicesStatus.api === 'ready' ? 'text-emerald-400' : 'text-amber-400'}>
                  API: {servicesStatus.api === 'ready' ? '● Ready' : '○ Waking...'}
                </span>
                <span className={servicesStatus.worker === 'ready' ? 'text-emerald-400' : 'text-amber-400'}>
                  Worker: {servicesStatus.worker === 'ready' ? '● Ready' : '○ Waking...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
