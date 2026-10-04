import React from 'react';
import { Button } from '@/components/ui/Button';
import { Play, Send } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

export const ActionBar = ({ language, setLanguage, onRun, onSubmit, isRunning, isSubmitting }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-card/40 border-b border-border/50 backdrop-blur-sm gap-2">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <LanguageSelector value={language} onChange={setLanguage} className="w-28 sm:w-44 text-xs sm:text-sm" />
      </div>
      
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <Button 
          variant="secondary" 
          onClick={onRun} 
          disabled={isRunning || isSubmitting}
          className="gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm bg-white/5 hover:bg-white/10"
        >
          <Play size={14} className={isRunning ? "animate-pulse" : ""} />
          <span className="hidden xs:inline sm:inline">Run Code</span>
          <span className="xs:hidden sm:hidden">Run</span>
        </Button>
        <Button 
          variant="primary" 
          onClick={onSubmit} 
          disabled={isRunning || isSubmitting}
          className="gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm shadow-glow-primary font-bold"
        >
          <Send size={14} className={isSubmitting ? "animate-pulse" : ""} />
          <span>Submit</span>
        </Button>
      </div>
    </div>
  );
};
