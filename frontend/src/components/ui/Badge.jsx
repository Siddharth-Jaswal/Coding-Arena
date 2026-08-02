import React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-primary/20 text-primary border-primary/20",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
  destructive: "bg-destructive/20 text-destructive border-destructive/20",
  outline: "text-foreground",
  success: "bg-success/20 text-success border-success/20",
};

function Badge({ className, variant = "default", ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
