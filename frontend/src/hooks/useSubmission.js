import { useState, useEffect, useRef } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { submissionApi } from '@/api/submissions';

export const useSubmission = (problemId, language) => {
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [consoleMessages, setConsoleMessages] = useState('');
  
  const getTimestamp = () => {
    const now = new Date();
    return `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;
  };

  const appendToConsole = (msg) => {
    setConsoleMessages(prev => prev + `${getTimestamp()}\n${msg}\n-----------------------------------\n`);
  };

  // The Mutation to initially submit the code
  const submitMutation = useMutation({
    mutationFn: (source_code) => {
      setConsoleMessages(''); // Clear on new submit
      appendToConsole('Starting submission process...');
      return submissionApi.createSubmission({
        user_id: 1, // Hardcoded for now
        problem_id: parseInt(problemId, 10),
        language,
        source_code,
      });
    },
    onSuccess: (data) => {
      // The API initially returns { submission_id, status: 'queued' }
      setActiveSubmission({
        submission_id: data.submission_id,
        status: data.status || 'queued',
      });
      appendToConsole(`Submission queued (ID: ${data.submission_id})...`);
    },
    onError: (error) => {
      appendToConsole(`Submission failed: ${error.message || 'Unknown error'}`);
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
        // Only trigger console updates if status changed
        if (prev?.status !== statusData.status) {
          if (statusData.status === 'running') {
            appendToConsole('Running against hidden test cases...');
          } else if (statusData.status === 'completed') {
            appendToConsole('Execution finished. Check Submission tab for verdict.');
          }
        }
        // Always store full data
        return { ...prev, ...statusData, hasPollingError: false };
      });
    }
  }, [statusData]);

  useEffect(() => {
    if (isError) {
      appendToConsole(`Polling failed: ${error.message}`);
      setActiveSubmission(prev => prev ? { ...prev, hasPollingError: true } : null);
    }
  }, [isError, error]);

  const retryPolling = () => {
    if (activeSubmission) {
      setActiveSubmission(prev => ({ ...prev, hasPollingError: false }));
      appendToConsole('Retrying judge connection...');
      refetch();
    }
  };

  // Clean up when unmounting
  useEffect(() => {
    return () => {
      setActiveSubmission(null);
    };
  }, []);

  const runCodeMutation = useMutation({
    mutationFn: (source_code) => {
      setConsoleMessages('');
      appendToConsole('Running code against public sample tests...');
      return submissionApi.runCode({
        problem_id: parseInt(problemId, 10),
        language,
        source_code,
      });
    },
    onSuccess: (data) => {
      appendToConsole(`Status: ${data.verdict}\nExecution Time: ${data.execution_time_ms}ms`);
      
      if (data.compiler_output) {
        appendToConsole(`Compiler Output:\n${data.compiler_output}`);
      }

      if (data.test_results && data.test_results.length > 0) {
        data.test_results.forEach((test, index) => {
          appendToConsole(
            `Test Case ${test.test_case || index + 1}:\n` +
            `Verdict: ${test.status}\n` +
            `Time: ${test.execution_time_ms}ms\n` +
            `Expected Output:\n${test.expected_output}\n` +
            `Actual Output:\n${test.actual_output}`
          );
        });
      }
    },
    onError: (error) => {
      appendToConsole(`Run failed: ${error.message || 'Unknown error'}`);
    }
  });

  return {
    submitSolution: submitMutation.mutate,
    runSolution: runCodeMutation.mutate,
    isRunning: runCodeMutation.isPending,
    isSubmitting: submitMutation.isPending || (activeSubmission && activeSubmission.status !== 'completed'),
    activeSubmission,
    consoleMessages,
    setConsoleMessages,
    retryPolling
  };
};
