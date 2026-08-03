import React from "react";
import { Stack } from "../layout";

export const EmptyState = ({ 
  icon: Icon, 
  title = "No results found", 
  description = "We couldn't find anything matching your search.",
  children 
}) => {
  return (
    <Stack align="center" justify="center" gap={4} className="py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground mb-2">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-xl font-semibold text-foreground">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto">{description}</p>
      {children && <div className="mt-4">{children}</div>}
    </Stack>
  );
};
