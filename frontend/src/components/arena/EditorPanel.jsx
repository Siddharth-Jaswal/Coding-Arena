import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { SaveStatus } from './SaveStatus';

const DEFAULT_CPP_TEMPLATE = `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int main() {
    // Fast I/O
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    // Your code here
    
    return 0;
}
`;

export const EditorPanel = ({ problemId, language, onRun, onSubmit, className }) => {
  const monaco = useMonaco();
  const editorRef = useRef(null);
  const [code, setCode] = useState('');
  const [saveStatus, setSaveStatus] = useState('saved');

  // Handle LocalStorage Persistence
  useEffect(() => {
    if (!problemId) return;
    const cacheKey = `arena_code_${problemId}_${language}`;
    const cachedCode = localStorage.getItem(cacheKey);
    
    if (cachedCode) {
      setCode(cachedCode);
    } else {
      // Initialize with default template if C++
      const defaultCode = language === 'cpp' ? DEFAULT_CPP_TEMPLATE : '// Write your code here';
      setCode(defaultCode);
    }
  }, [problemId, language]);

  // Handle Monaco Theme Injection to match existing Design System
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('arena-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { background: '0a0a0a' }
        ],
        colors: {
          'editor.background': '#0a0a0a',
          'editor.lineHighlightBackground': '#111111',
          'editorLineNumber.foreground': '#404040',
          'editorIndentGuide.background': '#1a1a1a',
        }
      });
      monaco.editor.setTheme('arena-dark');
    }
  }, [monaco]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Global Keyboard Shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onSubmit();
    });
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => {
      onRun();
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onRun(); // As per requirement, Ctrl+S triggers Run
    });
  };

  const handleEditorChange = (value) => {
    setCode(value);
    setSaveStatus('unsaved');
  };

  // Debounced Auto-Save
  useEffect(() => {
    if (!problemId || saveStatus === 'saved') return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      const cacheKey = `arena_code_${problemId}_${language}`;
      localStorage.setItem(cacheKey, code);
      setSaveStatus('saved');
    }, 1000);

    return () => clearTimeout(timer);
  }, [code, problemId, language, saveStatus]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#0a0a0a] border-b border-border/40">
        <span className="text-xs font-mono text-muted-foreground">{language}</span>
        <SaveStatus status={saveStatus} />
      </div>
      <div className="flex-1 w-full h-[calc(100%-36px)]">
        <Editor
          height="100%"
          language={language}
          theme="arena-dark"
          value={code}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Menlo, monospace',
            padding: { top: 16, bottom: 16 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: true,
            formatOnPaste: true,
          }}
        />
      </div>
    </div>
  );
};
