import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { MatchProvider, useMatchContext } from '../contexts/MatchContext';
import { ContestHeader } from '../components/ContestHeader';
import { LiveScoreboard } from '../components/LiveScoreboard';
import { ProblemNavigator } from '@/components/common/ProblemNavigator';
import { PlayerCard } from '@/components/common/PlayerCard';
import { MatchEventFeed } from '@/components/common/MatchEventFeed';
import { ArenaWorkspace } from '@/components/arena/ArenaWorkspace';
import { useSubmission } from '@/hooks/useSubmission';
import { problemApi } from '@/api/problems';
import { WorkspaceProvider } from '@/features/workspace/contexts/WorkspaceContext';
import { CountdownOverlay } from '../components/CountdownOverlay';
import { MatchResultModal } from '../components/MatchResultModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useMatchmakingStore } from '@/features/matchmaking/store/useMatchmakingStore';

const ContestRoom = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    room,
    opponent,
    status,
    scores,
    events,
    endsAt,
    activeProblemId,
    setActiveProblemId,
    countdownSeconds,
    solvedProblemIds,
    attemptedProblemIds,
    winnerId,
    matchResult
  } = useMatchContext();

  // Navigation Guard
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (status === 'running') {
        e.preventDefault();
        e.returnValue = 'Contest is currently running. Leaving may result in forfeiting the match.';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [status]);

  // Terminal State Cleanup
  useEffect(() => {
    return () => {
      // If the component unmounts while the match is in a terminal state,
      // ensure we wipe the matchmaking store so it doesn't leak.
      if (useMatchmakingStore.getState().status === 'finished' || status === 'finished') {
        useMatchmakingStore.getState().reset();
      }
    };
  }, [status]);

  // Fetch full active problem data from backend (React Query cache)
  const { data: problemData } = useQuery({
    queryKey: ['problem', activeProblemId],
    queryFn: () => problemApi.getProblem(activeProblemId),
    enabled: !!activeProblemId,
    staleTime: 1000 * 60 * 5,
  });

  const activeProblem = problemData ? { ...problemData.problem, sample_tests: problemData.sample_tests } : null;

  // Single Submission Pipeline
  const { 
    submitSolution,
    runSolution,
    isRunning,
    isSubmitting,
    activeSubmission,
    consoleMessages, 
    setConsoleMessages,
    retryPolling
  } = useSubmission(activeProblemId, 'cpp');

  if (!room) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050505] text-white">
        Loading contest data...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#050505]">
      <ContestHeader room={room} status={status} endsAt={endsAt} />
      
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Left Sidebar (Fixed) */}
        <ProblemNavigator 
          problems={room.problems}
          activeProblemId={activeProblemId}
          onProblemChange={setActiveProblemId}
          solvedProblemIds={solvedProblemIds}
          attemptedProblemIds={attemptedProblemIds}
          disabled={status !== 'running'}
        />

        {/* Center Workspace (Draggable Internally) */}
        <WorkspaceProvider
          activeProblem={activeProblem}
          submissionState={{
            isRunning,
            isSubmitting,
            consoleMessages,
            activeSubmission
          }}
          submissionActions={{
            onRun: runSolution,
            onSubmit: submitSolution,
            onRetry: retryPolling,
            setConsoleMessages
          }}
          workspaceConfig={{
            readOnly: status !== 'running'
          }}
        >
          <ArenaWorkspace />
        </WorkspaceProvider>

        {/* Right Sidebar (Fixed) */}
        <div className="w-80 bg-card/40 border-l border-border/50 flex flex-col p-4 gap-4 overflow-y-auto backdrop-blur-md">
          <PlayerCard 
            user={opponent}
            isOnline={!opponent?.disconnected}
            title="Opponent"
          />
          <LiveScoreboard 
            currentUser={user}
            opponent={opponent}
            scores={scores}
            status={status}
          />
          <MatchEventFeed events={events} />
        </div>
      </div>

      {status === 'countdown' && (
        <CountdownOverlay startsInSeconds={countdownSeconds} />
      )}

      {status === 'finished' && (
        <MatchResultModal
          room={room}
          opponent={opponent}
          user={user}
          scores={scores}
          winnerId={winnerId}
          matchResult={matchResult}
        />
      )}

      {/* Opponent Disconnected Banner */}
      <AnimatePresence>
        {status === 'running' && opponent?.disconnected && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-amber-500/20 text-amber-500 border border-amber-500/30 px-6 py-2 rounded-full font-medium text-sm flex items-center gap-2 backdrop-blur-md shadow-lg"
          >
            <span className="relative flex h-3 w-3 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            Opponent disconnected. Waiting for reconnect...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ContestPage = () => {
  const { roomId } = useParams();
  
  return (
    <MatchProvider roomId={roomId}>
      <ContestRoom />
    </MatchProvider>
  );
};

export default ContestPage;
