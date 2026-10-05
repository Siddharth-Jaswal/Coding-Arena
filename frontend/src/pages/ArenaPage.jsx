import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { ArenaHeader } from '@/components/arena/ArenaHeader';
import { ArenaWorkspace } from '@/components/arena/ArenaWorkspace';
import { problemApi } from '@/api/problems';
import { useSubmission } from '@/hooks/useSubmission';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/common';
import { Button } from '@/components/ui/Button';

import { WorkspaceProvider } from '@/features/workspace/contexts/WorkspaceContext';

const ArenaPage = () => {
  const { id } = useParams();
  
  // 1. Fetch data from backend
  const { data: problemData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['problem', id],
    queryFn: () => problemApi.getProblem(id),
    staleTime: 1000 * 60 * 5,
  });

  const problem = problemData ? { ...problemData.problem, sample_tests: problemData.sample_tests } : null;

  // 2. Submission hook
  const {
    submitSolution,
    runSolution,
    isRunning,
    isSubmitting,
    activeSubmission,
    runResult,
    consoleMessages,
    setConsoleMessages,
    clearConsole,
    retryPolling
  } = useSubmission(id, 'cpp');

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#050505]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !problem) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#050505] p-6 text-center">
        <ErrorState message={error?.message || "Failed to load problem details."}>
          <div className="flex gap-4">
            <Button onClick={() => refetch()} variant="outline">Try Again</Button>
            <Link to="/problems">
              <Button variant="ghost">Back to Problems</Button>
            </Link>
          </div>
        </ErrorState>
      </div>
    );
  }

  // 3. Render Workspace wrapped in WorkspaceProvider
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#050505]">
      {/* Top Navigation */}
      <ArenaHeader problem={problem} isLoading={isLoading} />
      <WorkspaceProvider
        activeProblem={problem}
        submissionState={{
          isRunning,
          isSubmitting,
          consoleMessages,
          activeSubmission,
          runResult
        }}
        submissionActions={{
          onRun: runSolution,
          onSubmit: submitSolution,
          onRetry: retryPolling,
          setConsoleMessages,
          clearConsole
        }}
        workspaceConfig={{
          readOnly: false
        }}
      >
        <ArenaWorkspace />
      </WorkspaceProvider>
    </div>
  );
};

export default ArenaPage;
