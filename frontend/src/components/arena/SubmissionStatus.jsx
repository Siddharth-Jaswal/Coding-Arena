import React from 'react';
import { motion } from 'framer-motion';
import { fadeSlideUp } from '@/lib/motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Loader2, RefreshCw } from 'lucide-react';

const VerdictBadge = ({ verdict }) => {
  if (!verdict) return null;
  
  const v = verdict.toLowerCase();
  
  if (v === 'accepted') {
    return (
      <Badge variant="success" className="gap-1.5 px-3 py-1 text-sm font-medium">
        <CheckCircle2 size={14} /> Accepted
      </Badge>
    );
  }
  
  if (v === 'wrong answer') {
    return (
      <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-sm font-medium">
        <XCircle size={14} /> Wrong Answer
      </Badge>
    );
  }
  
  if (v === 'compilation error') {
    return (
      <Badge variant="warning" className="gap-1.5 px-3 py-1 text-sm font-medium bg-amber-500/20 text-amber-500">
        <AlertTriangle size={14} /> Compilation Error
      </Badge>
    );
  }
  
  if (v === 'runtime error') {
    return (
      <Badge variant="warning" className="gap-1.5 px-3 py-1 text-sm font-medium bg-orange-500/20 text-orange-500">
        <AlertTriangle size={14} /> Runtime Error
      </Badge>
    );
  }
  
  if (v === 'time limit exceeded') {
    return (
      <Badge variant="warning" className="gap-1.5 px-3 py-1 text-sm font-medium">
        <Clock size={14} /> Time Limit Exceeded
      </Badge>
    );
  }

  // Fallback
  return (
    <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm font-medium">
      {verdict}
    </Badge>
  );
};

const DataRow = ({ label, value }) => {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground text-sm font-medium">{value}</span>
    </div>
  );
};

const formatDate = (isoString) => {
  if (!isoString) return null;
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + d.getMilliseconds().toString().padStart(3, '0');
};

export const SubmissionStatus = ({ submission, onRetry }) => {
  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-muted-foreground">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          <Clock size={24} className="opacity-50" />
        </div>
        <p className="text-sm">No submissions yet.<br/>Submit your solution to see live judging.</p>
      </div>
    );
  }

  if (submission.hasPollingError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <AlertTriangle size={32} className="text-warning opacity-80" />
        <div className="text-sm text-warning/90 font-medium">Judge Connection Lost</div>
        <p className="text-xs text-muted-foreground max-w-[200px]">Failed to retrieve submission status from the server.</p>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2 mt-2">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      key={submission.submission_id}
      initial="initial" 
      animate="animate" 
      variants={fadeSlideUp}
      className="flex flex-col h-full bg-card/20 rounded-lg border border-border/50 p-4 overflow-y-auto custom-scrollbar"
    >
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold">Submission #{submission.submission_id}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-muted-foreground px-2 py-0.5 bg-white/10 rounded">
              {submission.language || 'cpp'}
            </span>
          </div>
        </div>
        
        {submission.status === 'completed' ? (
          <VerdictBadge verdict={submission.verdict} />
        ) : (
          <div className="flex items-center gap-2 text-primary font-medium text-sm bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <Loader2 size={14} className="animate-spin" />
            <span className="capitalize">{submission.status}...</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-1">
        <DataRow label="Verdict" value={submission.verdict ? submission.verdict : (submission.status !== 'completed' ? 'Pending' : 'N/A')} />
        <DataRow label="Execution Time" value={submission.execution_time_ms ? `${submission.execution_time_ms} ms` : null} />
        <DataRow label="Created At" value={formatDate(submission.created_at)} />
        <DataRow label="Started At" value={formatDate(submission.started_at)} />
        <DataRow label="Finished At" value={formatDate(submission.finished_at)} />
      </div>

      {submission.status !== 'completed' && (
        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
          <div className="w-2 h-2 rounded-full bg-primary/50" />
          Listening for updates...
        </div>
      )}
    </motion.div>
  );
};
