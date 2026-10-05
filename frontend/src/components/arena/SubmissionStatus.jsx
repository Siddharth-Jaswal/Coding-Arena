import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  Zap, 
  Send,
  Code2,
  Calendar,
  Flame,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const SubmissionStatus = ({ submission, onRetry }) => {
  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8 text-muted-foreground">
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Send size={20} className="opacity-40 text-neutral-400" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-neutral-300">No active submission</p>
          <p className="text-[11px] text-muted-foreground max-w-xs">
            Submit your solution using the "Submit" button above to evaluate against all hidden test cases.
          </p>
        </div>
      </div>
    );
  }

  if (submission.hasPollingError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <AlertTriangle size={24} className="text-amber-400" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-amber-300">Judge Connection Issue</h4>
          <p className="text-xs text-muted-foreground max-w-xs">
            Lost connection while fetching submission verdict. Your submission is still running in the cloud.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 mt-2 border-white/10 hover:bg-white/5 text-xs">
          <RefreshCw size={13} /> Retry Connection
        </Button>
      </div>
    );
  }

  const isCompleted = submission.status === 'completed';
  const verdict = submission.verdict || '';
  const v = verdict.toLowerCase();

  const isAccepted = v === 'accepted';
  const isWrongAnswer = v === 'wrong answer';
  const isTLE = v === 'time limit exceeded';
  const isCompilationError = v === 'compilation error';
  const isRuntimeError = v === 'runtime error';

  const executionTime = submission.execution_time_ms !== undefined && submission.execution_time_ms !== null
    ? `${submission.execution_time_ms} ms`
    : null;

  return (
    <div className="flex flex-col h-full space-y-4">
      
      {/* 1. In-Progress Stepper */}
      {!isCompleted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 rounded-2xl bg-gradient-to-b from-primary/10 to-primary/5 border border-primary/30 flex flex-col items-center justify-center text-center space-y-4 shadow-xl"
        >
          <div className="relative">
            <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center shadow-[0_0_25px_rgba(var(--primary-rgb),0.35)]">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white tracking-wide">
              {submission.status === 'running' ? 'Evaluating Against Hidden Test Cases...' : 'Submission Queued in Judge Pipeline...'}
            </h3>
            <p className="text-xs text-muted-foreground font-mono">
              Submission #{submission.submission_id} • Language: {submission.language || 'cpp'}
            </p>
          </div>

          {/* Steps Progress */}
          <div className="flex items-center gap-3 text-xs font-semibold pt-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={13} /> Queued
            </span>
            <span className="text-neutral-600">→</span>
            <span className={`flex items-center gap-1.5 ${submission.status === 'running' ? 'text-primary animate-pulse' : 'text-neutral-500'}`}>
              <Loader2 size={13} className={submission.status === 'running' ? 'animate-spin' : ''} /> Judging
            </span>
            <span className="text-neutral-600">→</span>
            <span className="text-neutral-500">Verdict</span>
          </div>
        </motion.div>
      ) : (
        /* 2. PROPER HIGH-IMPACT FLASH VERDICT BANNER */
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl border shadow-2xl backdrop-blur-md ${
            isAccepted
              ? 'bg-gradient-to-br from-emerald-950/40 via-emerald-900/20 to-black border-emerald-500/40 shadow-emerald-500/15'
              : isWrongAnswer
              ? 'bg-gradient-to-br from-rose-950/40 via-rose-900/20 to-black border-rose-500/40 shadow-rose-500/15'
              : isTLE
              ? 'bg-gradient-to-br from-amber-950/40 via-amber-900/20 to-black border-amber-500/40 shadow-amber-500/15'
              : isCompilationError
              ? 'bg-gradient-to-br from-orange-950/40 via-orange-900/20 to-black border-orange-500/40 shadow-orange-500/15'
              : 'bg-gradient-to-br from-red-950/40 via-red-900/20 to-black border-red-500/40 shadow-red-500/15'
          }`}
        >
          {/* Subtle Ambient Glow */}
          <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none ${
            isAccepted ? 'bg-emerald-400' : isWrongAnswer ? 'bg-rose-500' : isTLE ? 'bg-amber-400' : 'bg-orange-500'
          }`} />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-4">
              {/* Verdict Icon */}
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 shadow-lg ${
                isAccepted
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400 shadow-emerald-500/20'
                  : isWrongAnswer
                  ? 'bg-rose-500/20 border-rose-400/50 text-rose-400 shadow-rose-500/20'
                  : isTLE
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-400 shadow-amber-500/20'
                  : 'bg-orange-500/20 border-orange-400/50 text-orange-400 shadow-orange-500/20'
              }`}>
                {isAccepted && <CheckCircle2 className="w-8 h-8" />}
                {isWrongAnswer && <XCircle className="w-8 h-8" />}
                {isTLE && <Clock className="w-8 h-8" />}
                {(isCompilationError || isRuntimeError) && <AlertTriangle className="w-8 h-8" />}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                    isAccepted ? 'text-emerald-400' : isWrongAnswer ? 'text-rose-400' : isTLE ? 'text-amber-400' : 'text-orange-400'
                  }`}>
                    {verdict || 'Evaluation Complete'}
                  </h2>
                  {isAccepted && (
                    <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                      <Sparkles size={12} /> Solved
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 mt-1">
                  {isAccepted && 'Great job! Your solution passed all hidden test cases.'}
                  {isWrongAnswer && 'Your output differed from expected output on hidden judge tests.'}
                  {isTLE && 'Your algorithm exceeded the maximum allowed runtime limit.'}
                  {isCompilationError && 'Syntax error during compilation. Review compiler diagnostics below.'}
                  {isRuntimeError && 'Program terminated unexpectedly during execution.'}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2 sm:flex-col sm:items-end shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
              {executionTime && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 border border-white/10 text-xs font-mono">
                  <Zap size={13} className="text-amber-400" />
                  <span className="text-neutral-400">Runtime:</span>
                  <strong className="text-white">{executionTime}</strong>
                </div>
              )}
              <div className="text-[11px] font-mono text-muted-foreground">
                Submission #{submission.submission_id}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Detailed Metadata Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Status</span>
          <span className="text-xs font-semibold text-foreground capitalize block truncate">
            {submission.status || 'Pending'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Language</span>
          <span className="text-xs font-semibold font-mono text-foreground uppercase block truncate">
            {submission.language || 'cpp'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Execution Time</span>
          <span className="text-xs font-semibold font-mono text-foreground block truncate">
            {executionTime || '--'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Submitted At</span>
          <span className="text-xs font-semibold font-mono text-foreground block truncate">
            {submission.created_at ? new Date(submission.created_at).toLocaleTimeString() : 'Just now'}
          </span>
        </div>
      </div>

      {/* Helpful TLE / WA Diagnostics Advice */}
      {isTLE && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <Clock size={14} /> Optimization Hint
          </div>
          <p className="text-[11px] leading-relaxed text-amber-200/70">
            Check for infinite loops (e.g., while condition never terminating) or suboptimal asymptotic time complexity. Look for opportunities to replace nested loops with hashmaps, prefix arrays, or two pointers.
          </p>
        </div>
      )}

      {isWrongAnswer && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-200/90 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-rose-300">
            <AlertTriangle size={14} /> Debugging Hint
          </div>
          <p className="text-[11px] leading-relaxed text-rose-200/70">
            Check corner test cases: empty inputs, single element arrays, maximum boundary values, negative numbers, or integer overflow.
          </p>
        </div>
      )}

    </div>
  );
};

const Sparkles = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
);
