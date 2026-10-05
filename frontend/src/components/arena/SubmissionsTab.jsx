import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Code2, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowLeft, 
  Zap, 
  ChevronRight, 
  Loader2, 
  Calendar,
  Sparkles,
  RotateCw
} from 'lucide-react';
import { submissionApi } from '@/api/submissions';
import { useWorkspace } from '@/features/workspace/contexts/WorkspaceContext';

const formatRelativeTime = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const date = new Date(timestamp);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) return `${Math.max(1, Math.floor(diffSec / 60))}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const formatFullDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const getVerdictConfig = (verdict, status) => {
  const normVerdict = (verdict || '').toLowerCase().trim();
  const normStatus = (status || '').toLowerCase().trim();

  if (normStatus === 'queued' || normStatus === 'processing' || normStatus === 'judging') {
    return {
      title: 'Judging...',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/20 text-amber-300',
      icon: Loader2,
      spin: true
    };
  }

  if (normVerdict === 'accepted' || normVerdict === 'ac') {
    return {
      title: 'Accepted',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      badgeBg: 'bg-emerald-500/20 text-emerald-300',
      icon: CheckCircle2,
      spin: false
    };
  }

  if (normVerdict.includes('time limit') || normVerdict === 'tle') {
    return {
      title: 'Time Limit Exceeded',
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/30',
      badgeBg: 'bg-sky-500/20 text-sky-300',
      icon: Clock,
      spin: false
    };
  }

  if (normVerdict.includes('compil') || normVerdict === 'ce') {
    return {
      title: 'Compile Error',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      badgeBg: 'bg-violet-500/20 text-violet-300',
      icon: AlertTriangle,
      spin: false
    };
  }

  if (normVerdict.includes('runtime') || normVerdict === 're') {
    return {
      title: 'Runtime Error',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
      badgeBg: 'bg-rose-500/20 text-rose-300',
      icon: AlertTriangle,
      spin: false
    };
  }

  return {
    title: verdict || 'Wrong Answer',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    badgeBg: 'bg-rose-500/20 text-rose-300',
    icon: XCircle,
    spin: false
  };
};

export const SubmissionsTab = ({ problemId, onSubmissionsLoaded }) => {
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copied, setCopied] = useState(false);
  const [restored, setRestored] = useState(false);

  const workspace = useWorkspace();
  const {
    submissionState,
    setEditorCode,
    setActiveLanguage,
    setActiveMobileTab,
    activeProblem
  } = workspace || {};

  const effectiveProblemId = problemId || activeProblem?.id;

  const fetchSubmissions = useCallback(async () => {
    if (!effectiveProblemId) return;
    setIsLoading(true);
    try {
      const res = await submissionApi.getProblemSubmissions(effectiveProblemId);
      // Support both unwrapped array (from axios response interceptor) and nested data formats
      const list = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.submissions)
        ? res.submissions
        : [];
      setSubmissions(list);
      onSubmissionsLoaded?.(list.length);
    } catch (err) {
      console.error('Failed to load past submissions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveProblemId, onSubmissionsLoaded]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Auto-refresh when an active submission completes
  useEffect(() => {
    if (submissionState?.activeSubmission?.status === 'completed' || submissionState?.activeSubmission?.verdict) {
      const timer = setTimeout(() => {
        fetchSubmissions();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [submissionState?.activeSubmission, fetchSubmissions]);

  const handleCopy = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRestore = (submission) => {
    if (!submission?.source_code) return;
    if (setEditorCode) {
      setEditorCode(submission.source_code);
    }
    if (submission.language && setActiveLanguage) {
      setActiveLanguage(submission.language);
    }
    setRestored(true);
    setTimeout(() => setRestored(false), 2500);

    // If on mobile, switch to code tab automatically
    if (setActiveMobileTab) {
      setActiveMobileTab('code');
    }
  };

  // Compute Statistics
  const totalCount = submissions.length;
  const acceptedList = submissions.filter(s => (s.verdict || '').toLowerCase() === 'accepted');
  const acceptedCount = acceptedList.length;
  const acceptanceRate = totalCount > 0 ? Math.round((acceptedCount / totalCount) * 100) : 0;
  
  // Fastest runtime among accepted submissions
  const runtimes = acceptedList
    .map(s => s.execution_time_ms)
    .filter(t => typeof t === 'number' && t > 0);
  const bestRuntime = runtimes.length > 0 ? Math.min(...runtimes) : null;

  // Single Submission Detail View
  if (selectedSubmission) {
    const verdictInfo = getVerdictConfig(selectedSubmission.verdict, selectedSubmission.status);
    const StatusIcon = verdictInfo.icon;
    const lines = (selectedSubmission.source_code || '').split('\n');

    return (
      <div className="flex flex-col h-full bg-background animate-in fade-in duration-200">
        {/* Navigation & Action Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-neutral-900/40 backdrop-blur shrink-0">
          <button
            onClick={() => setSelectedSubmission(null)}
            className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to All Submissions</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(selectedSubmission.source_code)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 transition-all"
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleRestore(selectedSubmission)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 hover:border-primary/60 transition-all shadow-[0_0_12px_rgba(59,130,246,0.2)]"
              title="Load this code back into the editor"
            >
              {restored ? (
                <>
                  <Check size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">Loaded to Editor!</span>
                </>
              ) : (
                <>
                  <RotateCcw size={13} />
                  <span>Restore to Editor</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Submission Meta Card */}
        <div className="p-6 border-b border-border/30 bg-neutral-950/60">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${verdictInfo.bg} ${verdictInfo.border} border`}>
                <StatusIcon size={20} className={`${verdictInfo.color} ${verdictInfo.spin ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <h3 className={`text-base font-bold ${verdictInfo.color}`}>
                  {verdictInfo.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} className="text-neutral-500" />
                    {formatFullDate(selectedSubmission.created_at)}
                  </span>
                  <span>•</span>
                  <span>{formatRelativeTime(selectedSubmission.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-1.5 text-xs text-neutral-300">
                <Clock size={12} className="text-neutral-400" />
                <span className="font-semibold text-white">
                  {selectedSubmission.execution_time_ms != null ? `${selectedSubmission.execution_time_ms} ms` : '—'}
                </span>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold uppercase text-primary tracking-wider">
                {selectedSubmission.language || 'code'}
              </div>
            </div>
          </div>
        </div>

        {/* Read-only Code View */}
        <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-[#070709]">
          <div className="rounded-xl border border-white/10 bg-[#0a0a0f] overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-neutral-900/60 text-xs text-neutral-400 font-mono">
              <div className="flex items-center gap-2">
                <Code2 size={13} className="text-primary" />
                <span>Submitted Code ({selectedSubmission.language})</span>
              </div>
              <span>{lines.length} lines</span>
            </div>

            <div className="p-4 overflow-x-auto text-xs font-mono leading-relaxed select-text">
              <table className="w-full border-collapse">
                <tbody>
                  {lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="pr-4 text-right select-none text-neutral-600 font-mono text-[11px] w-8">
                        {idx + 1}
                      </td>
                      <td className="whitespace-pre text-neutral-200">
                        {line || ' '}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Overview Stats Bar */}
      <div className="px-6 py-4 border-b border-border/40 bg-neutral-950/40 backdrop-blur shrink-0">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Performance Overview
          </span>
          <button
            onClick={() => fetchSubmissions()}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            title="Refresh submissions"
          >
            <RotateCw size={11} className={isLoading ? 'animate-spin text-primary' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              Total Attempts
            </span>
            <span className="text-xl font-bold text-white mt-1">
              {totalCount}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              Acceptance
            </span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-xl font-bold ${acceptanceRate > 0 ? 'text-emerald-400' : 'text-white'}`}>
                {acceptanceRate}%
              </span>
              <span className="text-[11px] text-neutral-500">
                ({acceptedCount}/{totalCount})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex flex-col">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider flex items-center gap-1">
              <Zap size={11} className="text-amber-400" />
              Best Runtime
            </span>
            <span className="text-xl font-bold text-amber-400 mt-1">
              {bestRuntime != null ? `${bestRuntime} ms` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {isLoading && submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-neutral-400 gap-3">
            <Loader2 size={24} className="animate-spin text-primary" />
            <span className="text-xs">Loading submission history...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-neutral-500 mb-4">
              <Code2 size={32} />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              No Submissions Yet
            </h3>
            <p className="text-xs text-neutral-400 max-w-xs leading-relaxed">
              Run and Submit your solution to record your attempts and track your runtime performance.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {submissions.map((sub, idx) => {
              const verdictInfo = getVerdictConfig(sub.verdict, sub.status);
              const StatusIcon = verdictInfo.icon;
              const isAccepted = (sub.verdict || '').toLowerCase() === 'accepted';

              return (
                <div
                  key={sub.id || idx}
                  onClick={() => setSelectedSubmission(sub)}
                  className="group relative flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/15 cursor-pointer transition-all duration-200 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2 rounded-lg ${verdictInfo.bg} ${verdictInfo.border} border shrink-0`}>
                      <StatusIcon size={16} className={`${verdictInfo.color} ${verdictInfo.spin ? 'animate-spin' : ''}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${verdictInfo.color} truncate`}>
                          {verdictInfo.title}
                        </span>
                        {isAccepted && bestRuntime === sub.execution_time_ms && (
                          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            <Sparkles size={10} />
                            Best
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                        <span className="font-mono text-[11px] uppercase text-neutral-300">
                          {sub.language}
                        </span>
                        <span>•</span>
                        <span>{formatRelativeTime(sub.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-semibold text-neutral-200">
                        {sub.execution_time_ms != null ? `${sub.execution_time_ms} ms` : '—'}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        {formatFullDate(sub.created_at).split(',')[0]}
                      </div>
                    </div>

                    <div className="p-1 rounded-lg text-neutral-500 group-hover:text-white group-hover:bg-white/10 transition-all">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
