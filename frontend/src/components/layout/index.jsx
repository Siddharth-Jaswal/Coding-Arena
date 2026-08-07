import React from 'react';
import { cn } from '@/lib/utils';
import { PageBackground } from '../ui/Backgrounds';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/motion';

export const Container = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8", className)} {...props}>
    {children}
  </div>
));
Container.displayName = "Container";

export const Section = React.forwardRef(({ className, children, ...props }, ref) => (
  <section ref={ref} className={cn("py-12 md:py-24", className)} {...props}>
    {children}
  </section>
));
Section.displayName = "Section";

export const PageWrapper = ({ children, className, withBackground = true }) => {
  const content = (
    <motion.main 
      className={cn("flex-1 flex flex-col w-full h-full", className)}
      {...pageTransition}
    >
      {children}
    </motion.main>
  );

  if (withBackground) {
    return <PageBackground>{content}</PageBackground>;
  }
  return content;
};

export const ContentWrapper = ({ children, className }) => (
  <div className={cn("relative z-10 w-full flex-1 flex flex-col", className)}>
    {children}
  </div>
);

export const Stack = React.forwardRef(({ className, direction = "col", gap = 4, align = "start", justify = "start", children, ...props }, ref) => {
  const flexClasses = {
    col: "flex-col",
    row: "flex-row",
  };
  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };
  const gapClasses = {
    1: "gap-1", 2: "gap-2", 3: "gap-3", 4: "gap-4", 6: "gap-6", 8: "gap-8", 12: "gap-12"
  };

  return (
    <div 
      ref={ref} 
      className={cn(
        "flex", 
        flexClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        gapClasses[gap] || "gap-4",
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
});
Stack.displayName = "Stack";

export const GridLayout = React.forwardRef(({ className, cols = 1, gap = 6, children, ...props }, ref) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };
  const gapClasses = {
    4: "gap-4", 6: "gap-6", 8: "gap-8"
  };

  return (
    <div 
      ref={ref} 
      className={cn(
        "grid",
        colClasses[cols] || colClasses[1],
        gapClasses[gap] || gapClasses[6],
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
});
GridLayout.displayName = "GridLayout";

export const CenterLayout = ({ children, className }) => (
  <div className={cn("flex flex-1 items-center justify-center w-full h-full", className)}>
    {children}
  </div>
);

import { useState, useEffect, useRef, useCallback } from 'react';

export const SplitPane = ({ 
  leftPane, 
  rightPane, 
  direction = "horizontal", 
  persistenceKey,
  defaultSize = 500, // Pixels
  min = 200,
  max = 2000, // Safe default max
  className 
}) => {
  const isHoriz = direction === "horizontal";
  const containerRef = useRef(null);
  const [size, setSize] = useState(defaultSize);
  const [isDragging, setIsDragging] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    if (persistenceKey) {
      const saved = localStorage.getItem(`split-${persistenceKey}`);
      if (saved) {
        setSize(parseInt(saved, 10));
      }
    }
  }, [persistenceKey]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDoubleClick = () => {
    setSize(defaultSize);
    if (persistenceKey) {
      localStorage.setItem(`split-${persistenceKey}`, defaultSize);
    }
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    let newSize;
    
    if (isHoriz) {
      newSize = e.clientX - containerRect.left;
    } else {
      newSize = e.clientY - containerRect.top;
    }

    if (newSize >= min && newSize <= max) {
      setSize(newSize);
    } else if (newSize < min) {
      setSize(min);
    } else if (newSize > max) {
      setSize(max);
    }
  }, [isDragging, isHoriz, min, max]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      if (persistenceKey) {
        localStorage.setItem(`split-${persistenceKey}`, size);
      }
    }
  }, [isDragging, persistenceKey, size]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = isHoriz ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, isHoriz, handleMouseMove, handleMouseUp]);

  return (
    <div 
      ref={containerRef}
      className={cn("flex w-full h-full overflow-hidden", isHoriz ? "flex-col md:flex-row" : "flex-col", className)}
    >
      <div 
        className="overflow-hidden flex flex-col" 
        style={{ 
          [isHoriz ? 'width' : 'height']: size,
          [isHoriz ? 'minWidth' : 'minHeight']: size, // Prevent shrinking flex
          flex: 'none'
        }}
      >
        {leftPane}
      </div>
      <div 
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className={cn(
          "bg-border/40 hover:bg-primary/50 transition-colors z-20 flex-shrink-0 relative group",
          isHoriz 
            ? "w-full h-1 md:w-[6px] md:h-full cursor-row-resize md:cursor-col-resize" 
            : "w-full h-[6px] cursor-row-resize"
        )} 
      >
        <div className={cn(
          "absolute inset-0 transition-opacity opacity-0 group-hover:opacity-100 bg-primary/30",
          isHoriz ? "w-full h-full" : "w-full h-full"
        )} />
      </div>
      <div className="flex-1 overflow-hidden h-full flex flex-col min-w-0 min-h-0">
        {rightPane}
      </div>
    </div>
  );
};
