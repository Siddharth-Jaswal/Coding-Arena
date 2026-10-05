import React, { useState } from 'react';
import { Terminal, TestTube, CheckCircle2, BookOpen, Code2, Play, Loader2 } from 'lucide-react';
import { SplitPane } from '@/components/layout';
import { ProblemPanel } from '@/components/arena/ProblemPanel';
import { EditorPanel } from '@/components/arena/EditorPanel';
import { BottomPanel } from '@/components/arena/BottomPanel';
import { ActionBar } from '@/components/arena/ActionBar';
import { SubmissionStatus } from '@/components/arena/SubmissionStatus';
import { TestCasesTab } from '@/components/arena/TestCasesTab';
import { TestResultTab } from '@/components/arena/TestResultTab';
import { ConsoleTab } from '@/components/arena/ConsoleTab';
import { useWorkspace } from '@/features/workspace/contexts/WorkspaceContext';

export const ArenaWorkspace = ({
  mobileTab: controlledMobileTab,
  onMobileTabChange: controlledOnMobileTabChange,
  hideMobileTabBar = false
}) => {
  const [internalMobileTab, setInternalMobileTab] = useState('problem');
  const activeMobileTab = controlledMobileTab !== undefined ? controlledMobileTab : internalMobileTab;
  const setMobileTab = controlledOnMobileTabChange || setInternalMobileTab;

  const {
    activeProblem,
    activeLanguage,
    setActiveLanguage,
    consoleMessages,
    clearConsole,
    submissionState,
    runResult,
    submissionActions,
    workspaceConfig,
    activeBottomTab,
    setActiveBottomTab,
    editorCode,
    setEditorCode
  } = useWorkspace();

  const { readOnly = false } = workspaceConfig || {};
  const { isRunning, isSubmitting, activeSubmission } = submissionState || {};
  const { onRun, onSubmit, onRetry } = submissionActions || {};

  const isLoading = !activeProblem;

  const isRunAccepted = runResult?.verdict?.toLowerCase() === 'accepted';
  const isSubmissionAccepted = activeSubmission?.verdict?.toLowerCase() === 'accepted';

  // Define tabs for the Bottom Panel
  const bottomTabs = [
    {
      label: 'Test Cases',
      icon: TestTube,
      content: (
        <TestCasesTab 
          problem={activeProblem} 
          runResult={runResult} 
          onRun={onRun} 
          isRunning={isRunning} 
        />
      )
    },
    {
      label: 'Test Result',
      icon: Play,
      badge: isRunning ? (
        <Loader2 size={11} className="text-primary animate-spin" />
      ) : runResult ? (
        <span className={`w-2 h-2 rounded-full ${isRunAccepted ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.7)]'}`} />
      ) : null,
      content: (
        <TestResultTab 
          runResult={runResult} 
          isRunning={isRunning} 
          onRun={onRun} 
        />
      )
    },
    {
      label: 'Verdict',
      icon: CheckCircle2,
      badge: isSubmitting ? (
        <Loader2 size={11} className="text-amber-400 animate-spin" />
      ) : activeSubmission?.verdict ? (
        <span className={`w-2 h-2 rounded-full ${isSubmissionAccepted ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]' : 'bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.7)]'}`} />
      ) : null,
      content: (
        <SubmissionStatus 
          submission={activeSubmission} 
          onRetry={onRetry} 
        />
      )
    },
    {
      label: 'Console',
      icon: Terminal,
      content: (
        <ConsoleTab 
          consoleMessages={consoleMessages} 
          onClear={clearConsole} 
        />
      )
    }
  ];

  return (
    <div className="flex-1 overflow-hidden relative z-10 flex flex-col h-full">
      {/* Mobile Tab Bar (Visible only on < md screens when not hidden by parent) */}
      {!hideMobileTabBar && (
        <div className="md:hidden flex items-center justify-around border-b border-border/50 bg-[#0a0a0f] p-1 shrink-0">
          <button
            onClick={() => setMobileTab('problem')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMobileTab === 'problem'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} />
            <span>Problem</span>
          </button>
          <button
            onClick={() => setMobileTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMobileTab === 'code'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Code2 size={14} />
            <span>Editor</span>
          </button>
          <button
            onClick={() => setMobileTab('console')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeMobileTab === 'console'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Terminal size={14} />
            <span>Console</span>
            {(isRunning || isSubmitting) && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping ml-1" />
            )}
          </button>
        </div>
      )}

      {/* Mobile Active Content View */}
      <div className="md:hidden flex-1 flex flex-col min-h-0 overflow-hidden">
        {activeMobileTab === 'problem' && (
          <div className="flex-1 overflow-y-auto">
            <ProblemPanel problem={activeProblem} isLoading={isLoading} />
          </div>
        )}

        {activeMobileTab === 'code' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a]">
            <ActionBar
              language={activeLanguage}
              setLanguage={setActiveLanguage}
              onRun={() => {
                onRun?.();
                setMobileTab('console');
              }}
              onSubmit={() => {
                onSubmit?.();
                setMobileTab('console');
              }}
              isRunning={isRunning}
              isSubmitting={isSubmitting}
            />
            <EditorPanel
              problemId={activeProblem?.id}
              language={activeLanguage}
              value={editorCode}
              onChange={setEditorCode}
              onRun={onRun}
              onSubmit={onSubmit}
              readOnly={readOnly}
              className="flex-1 flex flex-col min-h-0"
            />
          </div>
        )}

        {activeMobileTab === 'console' && (
          <div className="flex-1 flex flex-col min-h-0">
            <BottomPanel
              tabs={bottomTabs}
              defaultTab={0}
              activeTab={activeBottomTab}
              onTabChange={setActiveBottomTab}
              className="h-full border-t-0"
            />
          </div>
        )}
      </div>

      {/* Desktop Multi-Pane View (Visible on >= md screens) */}
      <div className="hidden md:block flex-1 h-full overflow-hidden">
        <SplitPane
          direction="horizontal"
          persistenceKey="arena-main"
          defaultSize={500}
          min={300}
          max={1000}
          leftPane={
            <ProblemPanel problem={activeProblem} isLoading={isLoading} />
          }
          rightPane={
            <div className="flex flex-col w-full h-full">
              <SplitPane
                direction="vertical"
                persistenceKey="arena-editor"
                defaultSize={450}
                min={200}
                max={800}
                leftPane={
                  <div className="flex flex-col h-full bg-[#0a0a0a]">
                    <EditorPanel 
                      problemId={activeProblem?.id} 
                      language={activeLanguage}
                      value={editorCode}
                      onChange={setEditorCode}
                      onRun={onRun}
                      onSubmit={onSubmit}
                      readOnly={readOnly}
                      className="flex-1 flex flex-col min-h-0"
                    />
                    <ActionBar 
                      language={activeLanguage}
                      setLanguage={setActiveLanguage}
                      onRun={onRun}
                      onSubmit={onSubmit}
                      isRunning={isRunning}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                }
                rightPane={
                  <BottomPanel 
                    tabs={bottomTabs} 
                    defaultTab={0} 
                    activeTab={activeBottomTab}
                    onTabChange={setActiveBottomTab}
                  />
                }
              />
            </div>
          }
        />
      </div>
    </div>
  );
};
