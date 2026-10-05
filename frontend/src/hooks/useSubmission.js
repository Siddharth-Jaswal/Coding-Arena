import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { submissionApi } from '@/api/submissions';

export const useSubmission = (problemId, defaultLanguage = 'cpp') => {
  const [submissionsByProblem, setSubmissionsByProblem] = useState({});
  const [runResultsByProblem, setRunResultsByProblem] = useState({});
  const [consolesByProblem, setConsolesByProblem] = useState({});

  const activeSubmission = submissionsByProblem[problemId] || null;
  const runResult = runResultsByProblem[problemId] || null;
  const consoleMessages = consolesByProblem[problemId] || '';

  const setActiveSubmission = (updateFnOrValue) => {
    if (!problemId) return;
    setSubmissionsByProblem(prev => {
      const current = prev[problemId] || null;
      const newValue = typeof updateFnOrValue === 'function' ? updateFnOrValue(current) : updateFnOrValue;
      return { ...prev, [problemId]: newValue };
    });
  };

  const setRunResult = (val) => {
    if (!problemId) return;
    setRunResultsByProblem(prev => ({ ...prev, [problemId]: val }));
  };

  const setConsoleMessages = (updateFnOrValue) => {
    if (!problemId) return;
    setConsolesByProblem(prev => {
      const current = prev[problemId] || '';
      const newValue = typeof updateFnOrValue === 'function' ? updateFnOrValue(current) : updateFnOrValue;
      return { ...prev, [problemId]: newValue };
    });
  };

  const getTimestamp = () => {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
  };

  const appendToConsole = (msg, tag = 'INFO') => {
    const icons = {
      INFO: 'ℹ️',
      WAIT: '⏳',
      RUN: '⚙️',
      OK: '✅',
      ERROR: '❌',
      WARN: '⚠️'
    };
    const icon = icons[tag] || '•';
    setConsoleMessages(prev => prev ? `${prev}\n${getTimestamp()} ${icon} ${msg}` : `${getTimestamp()} ${icon} ${msg}`);
  };

  const clearConsole = () => {
    if (!problemId) return;
    setConsolesByProblem(prev => ({ ...prev, [problemId]: '' }));
  };

  // The Mutation to initially submit the code
  const submitMutation = useMutation({
    mutationFn: (payload) => {
      const source_code = typeof payload === 'string' ? payload : payload?.source_code;
      const language = (typeof payload === 'object' && payload?.language) || defaultLanguage;
      
      appendToConsole(`Submitting solution in ${language.toUpperCase()}...`, 'WAIT');
      return submissionApi.createSubmission({
        problem_id: parseInt(problemId, 10),
        language,
        source_code,
      });
    },
    onSuccess: (data) => {
      setActiveSubmission({
        submission_id: data.submission_id,
        status: data.status || 'queued',
        verdict: null
      });
      appendToConsole(`Submission queued (ID: #${data.submission_id}). Waiting for judge...`, 'WAIT');
    },
    onError: (error) => {
      appendToConsole(`Submission failed to queue: ${error.message || 'Unknown error'}`, 'ERROR');
      setActiveSubmission(null);
    }
  });

  // The Query to poll the submission status
  const { data: statusData, isError, error, refetch } = useQuery({
    queryKey: ['submission', activeSubmission?.submission_id],
    queryFn: () => submissionApi.getSubmission(activeSubmission.submission_id),
    enabled: !!activeSubmission?.submission_id && activeSubmission?.status !== 'completed' && !activeSubmission?.hasPollingError,
    refetchInterval: (query) => {
      if (query.state.data?.status === 'completed' || activeSubmission?.hasPollingError) return false;
      return 1000;
    },
  });

  // Sync polling state with activeSubmission state and Console Output
  useEffect(() => {
    if (statusData) {
      setActiveSubmission(prev => {
        // Trigger clean step-by-step console messages
        if (prev?.status !== statusData.status) {
          if (statusData.status === 'running') {
            appendToConsole('Running against hidden judge test cases...', 'RUN');
          } else if (statusData.status === 'completed') {
            const isAccepted = statusData.verdict?.toLowerCase() === 'accepted';
            const iconTag = isAccepted ? 'OK' : 'ERROR';
            const timeStr = statusData.execution_time_ms ? ` (${statusData.execution_time_ms} ms)` : '';
            appendToConsole(`Judging completed: ${statusData.verdict}${timeStr}`, iconTag);
          }
        }
        return { ...prev, ...statusData, hasPollingError: false };
      });
    }
  }, [statusData]);

  useEffect(() => {
    if (isError) {
      appendToConsole(`Judge connection polling issue: ${error.message}`, 'WARN');
      setActiveSubmission(prev => prev ? { ...prev, hasPollingError: true } : null);
    }
  }, [isError, error]);

  const retryPolling = () => {
    if (activeSubmission) {
      setActiveSubmission(prev => ({ ...prev, hasPollingError: false }));
      appendToConsole('Retrying judge connection...', 'WAIT');
      refetch();
    }
  };

  const runCodeMutation = useMutation({
    mutationFn: (payload) => {
      const source_code = typeof payload === 'string' ? payload : payload?.source_code;
      const language = (typeof payload === 'object' && payload?.language) || defaultLanguage;
      
      appendToConsole(`Executing code against sample test cases (${language.toUpperCase()})...`, 'RUN');
      return submissionApi.runCode({
        problem_id: parseInt(problemId, 10),
        language,
        source_code,
      });
    },
    onSuccess: (data) => {
      setRunResult(data);
      const isAccepted = data.verdict?.toLowerCase() === 'accepted';
      const tag = isAccepted ? 'OK' : 'WARN';
      appendToConsole(`Run Finished: ${data.verdict} (${data.execution_time_ms} ms)`, tag);
      
      if (data.compiler_output) {
        appendToConsole(`Compiler Output:\n${data.compiler_output}`, 'ERROR');
      }
    },
    onError: (error) => {
      appendToConsole(`Code execution failed: ${error.message || 'Unknown error'}`, 'ERROR');
    }
  });

  const submitSolution = (codeOrPayload, lang) => {
    if (typeof codeOrPayload === 'object' && codeOrPayload !== null) {
      submitMutation.mutate(codeOrPayload);
    } else {
      submitMutation.mutate({ source_code: codeOrPayload, language: lang || defaultLanguage });
    }
  };

  const runSolution = (codeOrPayload, lang) => {
    if (typeof codeOrPayload === 'object' && codeOrPayload !== null) {
      runCodeMutation.mutate(codeOrPayload);
    } else {
      runCodeMutation.mutate({ source_code: codeOrPayload, language: lang || defaultLanguage });
    }
  };

  return {
    submitSolution,
    runSolution,
    isRunning: runCodeMutation.isPending,
    isSubmitting: submitMutation.isPending || (activeSubmission && activeSubmission.status !== 'completed'),
    activeSubmission,
    runResult,
    consoleMessages,
    setConsoleMessages,
    clearConsole,
    retryPolling
  };
};
