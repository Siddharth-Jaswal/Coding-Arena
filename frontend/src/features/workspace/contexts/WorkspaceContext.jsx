import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext(null);

export const WorkspaceProvider = ({ 
  children, 
  activeProblem, 
  submissionState, 
  submissionActions,
  workspaceConfig
}) => {
  const { readOnly = false } = workspaceConfig || {};
  
  // These caches store state independently for each problem ID
  const [codeCache, setCodeCache] = useState({});
  const [consoleCache, setConsoleCache] = useState({});
  const [tabCache, setTabCache] = useState({});
  const [editorStateCache, setEditorStateCache] = useState({});
  
  const [activeLanguage, setActiveLanguage] = useState('cpp');

  const problemId = activeProblem?.id;

  // Editor Code
  const editorCode = codeCache[problemId] !== undefined ? codeCache[problemId] : '';
  const setEditorCode = (code) => {
    if (!problemId) return;
    setCodeCache(prev => ({ ...prev, [problemId]: code }));
    localStorage.setItem(`workspace_code_${problemId}_${activeLanguage}`, code);
  };

  // On mount or problem change, load from localStorage if empty in cache
  useEffect(() => {
    if (problemId && codeCache[problemId] === undefined) {
      const saved = localStorage.getItem(`workspace_code_${problemId}_${activeLanguage}`);
      if (saved) {
        setCodeCache(prev => ({ ...prev, [problemId]: saved }));
      } else {
        const defaultCode = activeLanguage === 'cpp' ? '#include <iostream>\n\nusing namespace std;\n\nint main() {\n    return 0;\n}\n' : '// Write your code here';
        setCodeCache(prev => ({ ...prev, [problemId]: defaultCode }));
      }
    }
  }, [problemId, activeLanguage, codeCache]);

  // Console Messages
  // Merge external submissionState.consoleMessages with internal cache
  const internalConsole = consoleCache[problemId] || '';
  const consoleMessages = submissionState?.consoleMessages || internalConsole;
  
  const setConsoleMessages = (messages) => {
    if (!problemId) return;
    if (submissionActions?.setConsoleMessages) {
      submissionActions.setConsoleMessages(messages);
    }
    setConsoleCache(prev => ({ ...prev, [problemId]: messages }));
  };

  // Active Bottom Tab
  const activeBottomTab = tabCache[problemId] || 0;
  const setActiveBottomTab = (tabIndex) => {
    if (!problemId) return;
    setTabCache(prev => ({ ...prev, [problemId]: tabIndex }));
  };

  // Editor Scroll/Cursor State (for Monaco)
  const editorState = editorStateCache[problemId] || null;
  const setEditorState = (state) => {
    if (!problemId) return;
    setEditorStateCache(prev => ({ ...prev, [problemId]: state }));
  };

  // Override submission onRun to pass cached code
  const handleRun = () => {
    if (submissionActions?.onRun && editorCode) {
      setActiveBottomTab(0); // Switch to Console tab
      submissionActions.onRun(editorCode);
    }
  };

  const handleSubmit = () => {
    if (submissionActions?.onSubmit && editorCode) {
      setActiveBottomTab(2); // Switch to Submission tab
      submissionActions.onSubmit(editorCode);
    }
  };

  const value = {
    activeProblem,
    activeLanguage,
    setActiveLanguage,
    
    editorCode,
    setEditorCode,
    
    activeBottomTab,
    setActiveBottomTab,
    
    consoleMessages,
    setConsoleMessages,
    
    editorState,
    setEditorState,
    
    submissionState,
    submissionActions: {
      ...submissionActions,
      onRun: handleRun,
      onSubmit: handleSubmit
    },
    
    workspaceConfig: {
      ...workspaceConfig,
      readOnly
    }
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};
