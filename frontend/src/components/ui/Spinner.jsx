import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48
};

export const Spinner = ({ className, size = 24, ...props }) => {
  const resolvedSize = sizeMap[size] || size;
  return (
    <Loader2 
      size={resolvedSize} 
      className={cn("animate-spin text-muted-foreground", className)} 
      {...props} 
    />
  );
};
