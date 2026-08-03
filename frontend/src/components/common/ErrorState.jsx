import React from "react";
import { Stack } from "../layout";
import { AlertCircle } from "lucide-react";

export const ErrorState = ({ 
  title = "Something went wrong", 
  message = "Failed to load data. Please try again.",
  children 
}) => {
  return (
    <Stack align="center" justify="center" gap={4} className="py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive mb-2">
        <AlertCircle size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">{message}</p>
      {children && <div className="mt-4">{children}</div>}
    </Stack>
  );
};
