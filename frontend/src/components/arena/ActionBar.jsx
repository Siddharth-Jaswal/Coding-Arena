import React from 'react';
import { Button } from '@/components/ui/Button';
import { Play, Send } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

export const ActionBar = ({ language, setLanguage, onRun, onSubmit, isRunning, isSubmitting }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-card/40 border-b border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <LanguageSelector value={language} onChange={setLanguage} className="w-48" />
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="secondary" 
          onClick={onRun} 
          disabled={isRunning || isSubmitting}
          className="gap-2 bg-white/5 hover:bg-white/10"
        >
          <Play size={16} className={isRunning ? "animate-pulse" : ""} />
          Run Code
        </Button>
        <Button 
          variant="primary" 
          onClick={onSubmit} 
          disabled={isRunning || isSubmitting}
          className="gap-2 shadow-glow-primary"
        >
          <Send size={16} className={isSubmitting ? "animate-pulse" : ""} />
          Submit
        </Button>
      </div>
    </div>
  );
};
