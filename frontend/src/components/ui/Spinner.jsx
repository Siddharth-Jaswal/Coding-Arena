import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const Spinner = ({ className, size = 24, ...props }) => {
  return (
    <Loader2 
      size={size} 
      className={cn("animate-spin text-muted-foreground", className)} 
      {...props} 
    />
  );
};
