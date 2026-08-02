import React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { modalTransition, drawerTransition } from "@/lib/motion";
import { X } from "lucide-react";
import { IconButton } from "./Button";

export const Modal = ({ isOpen, onClose, title, children, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            <motion.div
              {...modalTransition}
              className={cn("pointer-events-auto w-full max-w-lg rounded-[24px] bg-card border border-border/50 shadow-soft overflow-hidden relative", className)}
            >
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/30">
                  <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                  <IconButton icon={X} variant="ghost" size="iconSm" onClick={onClose} aria-label="Close" />
                </div>
              )}
              {!title && (
                <div className="absolute right-4 top-4 z-10">
                  <IconButton icon={X} variant="ghost" size="iconSm" onClick={onClose} aria-label="Close" />
                </div>
              )}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export const Drawer = ({ isOpen, onClose, title, children, side = "right", className }) => {
  const isRight = side === "right";
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            {...drawerTransition}
            initial={{ opacity: 0, x: isRight ? "100%" : "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRight ? "100%" : "-100%" }}
            className={cn(
              "fixed top-0 bottom-0 z-50 w-full max-w-md bg-card border-border/50 shadow-soft flex flex-col",
              isRight ? "right-0 border-l" : "left-0 border-r",
              className
            )}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/30">
              <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
              <IconButton icon={X} variant="ghost" size="iconSm" onClick={onClose} aria-label="Close" />
            </div>
            <div className="flex-1 overflow-auto p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
