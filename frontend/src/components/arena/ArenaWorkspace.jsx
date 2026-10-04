import React, { useState } from 'react';
import { Terminal, TestTube, CheckCircle2, BookOpen, Code2 } from 'lucide-react';
import { SplitPane } from '@/components/layout';
import { ProblemPanel } from '@/components/arena/ProblemPanel';
import { EditorPanel } from '@/components/arena/EditorPanel';
import { BottomPanel } from '@/components/arena/BottomPanel';
import { ActionBar } from '@/components/arena/ActionBar';
import { SubmissionStatus } from '@/components/arena/SubmissionStatus';
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
    submissionState,
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

  // Define tabs for the Bottom Panel
  const bottomTabs = [
    {
      label: 'Console',
      icon: Terminal,
      content: (
        <div className="font-mono text-xs whitespace-pre-wrap text-muted-foreground">
          {consoleMessages || 'Click "Run Code" or "Submit" to see execution output.'}
        </div>
      )
    },
    {
      label: 'Test Cases',
      icon: TestTube,
      content: <div className="text-muted-foreground text-sm">Test case explorer will be integrated with the execution service.</div>
    },
    {
      label: 'Submission',
      icon: CheckCircle2,
      content: <SubmissionStatus submission={activeSubmission} onRetry={onRetry} />
    },
    {
      label: 'Judge Logs',
      icon: Terminal,
      content: <div className="text-muted-foreground text-sm">Detailed judge logs will appear here after submission.</div>
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
