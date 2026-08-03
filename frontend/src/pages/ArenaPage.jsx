import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Terminal, TestTube, CheckCircle2 } from 'lucide-react';

import { SplitPane } from '@/components/layout';
import { ArenaHeader } from '@/components/arena/ArenaHeader';
import { ProblemPanel } from '@/components/arena/ProblemPanel';
import { EditorPanel } from '@/components/arena/EditorPanel';
import { BottomPanel } from '@/components/arena/BottomPanel';
import { ActionBar } from '@/components/arena/ActionBar';
import { submissionService } from '@/services/submissionService';
import { problemApi } from '@/api/problems';
import { useSubmission } from '@/hooks/useSubmission';
import { SubmissionStatus } from '@/components/arena/SubmissionStatus';

const ArenaPage = () => {
  const { id } = useParams();
  
  // Reuse React Query cache from the Problem Browser
  const { data: problemData, isLoading } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => problemApi.getProblem(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const problem = problemData ? { ...problemData.problem, sample_tests: problemData.sample_tests } : null;

  const [language, setLanguage] = useState('cpp');
  const [isRunning, setIsRunning] = useState(false);

  const { 
    submitSolution, 
    isSubmitting,
    activeSubmission,
    consoleMessages, 
    setConsoleMessages,
    retryPolling
  } = useSubmission(id, language);

  const handleRun = async () => {
    setIsRunning(true);
    setConsoleMessages('Running code against sample tests...\n');
    try {
      const code = localStorage.getItem(`arena_code_${id}_${language}`) || '';
      const result = await submissionService.runCode(id, code, language);
      setConsoleMessages(prev => prev + `Status: ${result.status}\nOutput:\n${result.output}\nTime: ${result.execution_time_ms}ms | Memory: ${result.memory_mb}MB`);
    } catch (e) {
      setConsoleMessages(prev => prev + '\nExecution failed.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = () => {
    const code = localStorage.getItem(`arena_code_${id}_${language}`) || '';
    submitSolution(code);
  };

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
      content: <SubmissionStatus submission={activeSubmission} onRetry={retryPolling} />
    },
    {
      label: 'Judge Logs',
      icon: Terminal,
      content: <div className="text-muted-foreground text-sm">Detailed judge logs will appear here after submission.</div>
    }
  ];

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#050505]">
      {/* Top Navigation */}
      <ArenaHeader problem={problem} isLoading={isLoading} />
      
      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden relative z-10">
        <SplitPane
          leftRatio={40}
          rightRatio={60}
          direction="horizontal"
          leftPane={
            <ProblemPanel problem={problem} isLoading={isLoading} />
          }
          rightPane={
            <div className="flex flex-col w-full h-full">
              <SplitPane
                leftRatio={65}
                rightRatio={35}
                direction="vertical"
                leftPane={
                  <div className="flex flex-col h-full bg-[#0a0a0a]">
                    <EditorPanel 
                      problemId={id} 
                      language={language}
                      onRun={handleRun}
                      onSubmit={handleSubmit}
                      className="flex-1 flex flex-col min-h-0"
                    />
                    <ActionBar 
                      language={language}
                      setLanguage={setLanguage}
                      onRun={handleRun}
                      onSubmit={handleSubmit}
                      isRunning={isRunning}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                }
                rightPane={
                  <BottomPanel tabs={bottomTabs} defaultTab={0} />
                }
              />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default ArenaPage;
