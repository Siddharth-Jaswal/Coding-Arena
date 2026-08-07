import React from 'react';
import { Terminal, TestTube, CheckCircle2 } from 'lucide-react';
import { SplitPane } from '@/components/layout';
import { ProblemPanel } from '@/components/arena/ProblemPanel';
import { EditorPanel } from '@/components/arena/EditorPanel';
import { BottomPanel } from '@/components/arena/BottomPanel';
import { ActionBar } from '@/components/arena/ActionBar';
import { SubmissionStatus } from '@/components/arena/SubmissionStatus';
import { useWorkspace } from '@/features/workspace/contexts/WorkspaceContext';

export const ArenaWorkspace = () => {
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
    <div className="flex-1 overflow-hidden relative z-10">
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
  );
};
