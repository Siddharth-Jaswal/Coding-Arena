import React from 'react';
import { CheckCircle2, Loader2, CircleDashed } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SaveStatus = ({ status = 'saved', className }) => {
  return (
    <div className={cn("flex items-center gap-2 text-xs font-medium", className)}>
      {status === 'saving' && (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-warning" />
          <span className="text-warning">Saving...</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Saved</span>
        </>
      )}
      {status === 'unsaved' && (
        <>
          <CircleDashed className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-muted-foreground">Unsaved changes</span>
        </>
      )}
    </div>
  );
};
