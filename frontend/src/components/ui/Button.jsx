import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { buttonPress, hoverGlow } from "@/lib/motion";

const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 border border-transparent shadow-[0_0_15px_-3px_hsl(var(--primary)/0.3)]",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent",
  outline: "border border-border bg-transparent hover:bg-white/5 text-foreground hover:border-white/20",
  ghost: "bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground",
  glass: "bg-white/5 backdrop-blur-md border-gradient shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:bg-white/10 text-foreground",
  danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-transparent shadow-[0_0_15px_-3px_hsl(var(--destructive)/0.3)]",
};

const buttonSizes = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 py-2",
  lg: "h-12 px-8 text-base",
  icon: "h-10 w-10",
  iconSm: "h-8 w-8",
};

export const Button = React.forwardRef(
  ({ className, variant = "primary", size = "md", icon: Icon, children, ...props }, ref) => {
    const isIconOnly = !children && Icon;
    const resolvedSize = isIconOnly ? (size === "sm" ? "iconSm" : "icon") : size;
    
    // Primary/Danger buttons get a hover glow in Fluxora style
    const motionProps = (variant === "primary" || variant === "danger") 
      ? { ...buttonPress, ...hoverGlow } 
      : buttonPress;

    return (
      <motion.button
        ref={ref}
        {...motionProps}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          buttonVariants[variant],
          buttonSizes[resolvedSize],
          className
        )}
        {...props}
      >
        {Icon && <Icon className={cn("shrink-0", children ? "mr-2 h-4 w-4" : "h-5 w-5")} />}
        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";

export const IconButton = React.forwardRef((props, ref) => {
  return <Button ref={ref} {...props} />;
});
IconButton.displayName = "IconButton";
