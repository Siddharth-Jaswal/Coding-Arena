import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Trash2, Copy, Check, Sparkles } from 'lucide-react';

export const ConsoleTab = ({ consoleMessages, onClear }) => {
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleMessages]);

  const handleCopy = () => {
    if (!consoleMessages) return;
    navigator.clipboard.writeText(consoleMessages);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col h-full space-y-2.5">
      {/* Top Console Actions */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-primary" />
          <span className="text-xs font-semibold text-neutral-300">Execution Output</span>
        </div>

        <div className="flex items-center gap-1.5">
          {consoleMessages && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white text-[11px] transition-colors"
                title="Copy Terminal Output"
              >
                {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {onClear && (
                <button
                  onClick={onClear}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 text-[11px] transition-colors"
                  title="Clear Console"
                >
                  <Trash2 size={11} />
                  <span>Clear</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Terminal Output Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 rounded-xl bg-[#09090e] border border-white/5 font-mono text-xs text-neutral-300 leading-relaxed selection:bg-primary/30">
        {consoleMessages ? (
          <div className="space-y-1.5 whitespace-pre-wrap">
            {consoleMessages.split('\n').map((line, idx) => {
              const isAccepted = line.includes('Accepted') || line.includes('✅');
              const isError = line.includes('Error') || line.includes('Failed') || line.includes('Wrong Answer') || line.includes('❌');
              const isWarning = line.includes('Time Limit') || line.includes('⚠️');
              const isQueued = line.includes('queued') || line.includes('⏳');

              let lineClass = 'text-neutral-300';
              if (isAccepted) lineClass = 'text-emerald-400 font-semibold';
              else if (isError) lineClass = 'text-rose-400 font-semibold';
              else if (isWarning) lineClass = 'text-amber-400 font-semibold';
              else if (isQueued) lineClass = 'text-indigo-300';

              return (
                <div key={idx} className={`${lineClass} transition-colors`}>
                  {line}
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2 py-8 text-muted-foreground italic">
            <Terminal size={22} className="opacity-30" />
            <span>Click "Run Code" or "Submit" to view execution logs.</span>
          </div>
        )}
      </div>
    </div>
  );
};
