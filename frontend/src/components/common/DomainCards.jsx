import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import { motion } from "framer-motion";
import { cardHover } from "@/lib/motion";

export const InteractiveCard = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <motion.div {...cardHover} className="h-full">
      <Card ref={ref} variant="glass" className={cn("h-full cursor-pointer transition-colors hover:bg-white/10 group", className)} {...props}>
        {children}
      </Card>
    </motion.div>
  );
});
InteractiveCard.displayName = "InteractiveCard";

export const EditorCard = React.forwardRef(({ className, language = "JavaScript", children, headerRight, ...props }, ref) => {
  return (
    <Card ref={ref} variant="default" className={cn("flex flex-col h-full rounded-md border-border/50 bg-[#0d0d0d] overflow-hidden", className)} {...props}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/50">
        <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{language}</div>
        {headerRight && <div>{headerRight}</div>}
      </div>
      <div className="flex-1 relative font-mono text-sm leading-relaxed overflow-auto">
        {children || <div className="p-4 text-muted-foreground/30">// Code editor instance goes here...</div>}
      </div>
    </Card>
  );
});
EditorCard.displayName = "EditorCard";

export const ConsoleCard = React.forwardRef(({ className, status = "idle", output, ...props }, ref) => {
  return (
    <Card ref={ref} variant="default" className={cn("flex flex-col h-full rounded-md border-border/50 bg-[#050505] overflow-hidden", className)} {...props}>
      <div className="flex items-center px-4 py-2 border-b border-border/50 bg-background/50">
        <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          Terminal <span className={cn("h-2 w-2 rounded-full", status === "running" ? "bg-warning animate-pulse" : status === "error" ? "bg-destructive" : "bg-success")}></span>
        </div>
      </div>
      <div className="flex-1 p-4 font-mono text-xs text-secondary-foreground overflow-auto whitespace-pre-wrap">
        {output || <span className="text-muted-foreground/30">&gt; Waiting for execution...</span>}
      </div>
    </Card>
  );
});
ConsoleCard.displayName = "ConsoleCard";
