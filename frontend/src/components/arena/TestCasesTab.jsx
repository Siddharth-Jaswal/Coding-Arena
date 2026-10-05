import React, { useState } from 'react';
import { Copy, Check, Terminal, Play, Sparkles } from 'lucide-react';

export const TestCasesTab = ({ 
  problem, 
  runResult, 
  onRun, 
  isRunning 
}) => {
  const sampleTests = problem?.sample_tests || [];
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const currentTest = sampleTests[selectedCaseIdx] || null;
  const currentInput = currentTest?.input || currentTest?.input_data || '';
  const currentOutput = currentTest?.output || currentTest?.expected_output || '';

  // Match test result if available
  const currentResult = runResult?.test_results?.find(
    (t) => t.test_case === (selectedCaseIdx + 1)
  );

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Test Case Selector Tabs */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2.5 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
          {sampleTests.map((test, idx) => {
            const resultForThis = runResult?.test_results?.find((t) => t.test_case === idx + 1);
            const isPassed = resultForThis?.status?.toLowerCase() === 'accepted';
            const isFailed = resultForThis && !isPassed;
            const isSelected = selectedCaseIdx === idx;

            return (
              <button
                key={idx}
                onClick={() => setSelectedCaseIdx(idx)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white/10 text-white border border-white/20 shadow-sm'
                    : 'bg-white/[0.02] text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <span>Case {idx + 1}</span>
                {isPassed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                {isFailed && <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
              </button>
            );
          })}
        </div>

        {onRun && (
          <button
            onClick={onRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors"
          >
            <Play size={12} className={isRunning ? 'animate-pulse text-amber-400' : 'text-primary'} />
            <span>{isRunning ? 'Running...' : 'Run Cases'}</span>
          </button>
        )}
      </div>

      {currentTest ? (
        <div className="space-y-3.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {/* Input Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span className="uppercase tracking-wider text-[10px] text-muted-foreground/80 font-bold">Input</span>
              <button
                onClick={() => handleCopy(currentInput, 'input')}
                className="flex items-center gap-1 hover:text-white transition-colors text-[11px]"
                title="Copy Input"
              >
                {copiedField === 'input' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedField === 'input' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-[#0d0d12] border border-white/5 font-mono text-xs text-neutral-200 overflow-x-auto whitespace-pre-wrap select-all selection:bg-primary/30">
              {currentInput || '<empty>'}
            </pre>
          </div>

          {/* Expected Output Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span className="uppercase tracking-wider text-[10px] text-muted-foreground/80 font-bold">Expected Output</span>
              <button
                onClick={() => handleCopy(currentOutput, 'output')}
                className="flex items-center gap-1 hover:text-white transition-colors text-[11px]"
                title="Copy Expected Output"
              >
                {copiedField === 'output' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedField === 'output' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-3 rounded-lg bg-[#0d0d12] border border-white/5 font-mono text-xs text-neutral-200 overflow-x-auto whitespace-pre-wrap select-all selection:bg-primary/30">
              {currentOutput || '<empty>'}
            </pre>
          </div>

          {/* Status info if run was evaluated */}
          {currentResult && (
            <div className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
              currentResult.status?.toLowerCase() === 'accepted'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              <span className="font-semibold">Case {selectedCaseIdx + 1} Status: {currentResult.status}</span>
              <span className="font-mono">{currentResult.execution_time_ms} ms</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1 text-center text-muted-foreground space-y-2">
          <Terminal size={24} className="opacity-40" />
          <span className="text-xs">No sample test cases provided for this problem.</span>
        </div>
      )}
    </div>
  );
};
