import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "../ui/Card";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const CopyButton = ({ text, className }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-md transition-colors hover:bg-white/10 text-muted-foreground hover:text-foreground",
        copied && "text-success hover:text-success",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
};

export const SampleTestCard = ({ input, output, index }) => {
  return (
    <Card className="border-border/30 overflow-hidden">
      <CardHeader className="py-2 px-4 bg-muted/30 border-b border-border/30 flex-row items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Sample {index !== undefined ? index + 1 : "Test"}
        </span>
      </CardHeader>
      <CardContent className="p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/30">
        <div className="flex-1 p-4 relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary">Input</span>
            <CopyButton text={input} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">
            {input}
          </pre>
        </div>
        <div className="flex-1 p-4 relative group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary">Output</span>
            <CopyButton text={output} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-all">
            {output}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
