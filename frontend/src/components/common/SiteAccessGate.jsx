import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, KeyRound, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const SiteAccessGate = ({ children }) => {
  const requiredPassword = import.meta.env.VITE_SITE_ACCESS_PASSWORD;

  // If no password is configured, bypass the gatekeeper entirely
  if (!requiredPassword) {
    return children;
  }

  const [isUnlocked, setIsUnlocked] = useState(() => {
    return localStorage.getItem('codearena_site_unlocked') === 'true';
  });

  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputPassword.trim()) {
      setError('Please enter the access password');
      return;
    }

    if (inputPassword === requiredPassword) {
      localStorage.setItem('codearena_site_unlocked', 'true');
      setIsUnlocked(true);
      setError('');
    } else {
      setError('Incorrect access password. Access denied.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  if (isUnlocked) {
    return children;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden p-4 select-none">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-primary/10 blur-[130px] rounded-full pointer-events-none -top-40 -left-40" />
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none -bottom-40 -right-40" />

      <motion.div
        animate={isShaking ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-card/85 border border-border/80 rounded-3xl p-8 shadow-2xl relative z-10 backdrop-blur-xl text-center"
      >
        {/* Lock Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary mb-5 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        {/* Branding & Title */}
        <div className="mb-6">
          <span className="text-xs uppercase font-mono tracking-widest text-primary font-bold bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            Private Beta
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-3 text-foreground">
            CODING<span className="text-primary">ARENA</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed max-w-xs mx-auto">
            This platform is currently private to conserve cloud compute quotas. Please enter the access password to proceed.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative text-left">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground">
              <KeyRound size={16} />
            </div>

            <input
              type={showPassword ? 'text' : 'password'}
              value={inputPassword}
              onChange={(e) => {
                setInputPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Enter site access key..."
              autoFocus
              className="w-full pl-10 pr-10 py-3 rounded-xl bg-background/80 border border-border/70 text-foreground placeholder:text-muted-foreground/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20 text-left"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            className="w-full py-3 gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-bold shadow-lg shadow-primary/25 rounded-xl transition-all"
          >
            <span>Unlock Arena</span>
            <ArrowRight size={16} />
          </Button>
        </form>

        {/* Footer info */}
        <div className="mt-6 pt-5 border-t border-border/30 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck size={13} className="text-emerald-400" />
          <span>Protected deployment environment</span>
        </div>
      </motion.div>
    </div>
  );
};
