import React from 'react';
import { cn } from '@/lib/utils';

export const GridOverlay = ({ className, size = 40, opacity = 0.03 }) => {
  return (
    <div className={cn("absolute inset-0 z-0 pointer-events-none", className)} style={{ opacity }}>
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width={size} height={size} patternUnits="userSpaceOnUse">
            <path d={`M.5 ${size}V.5H${size}`} fill="none" stroke="currentColor" strokeWidth={1} strokeDasharray="4 4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
    </div>
  );
};

export const RadialGlow = ({ className, color = "hsl(var(--primary))", opacity = 0.15 }) => {
  return (
    <div 
      className={cn("absolute z-0 pointer-events-none rounded-full blur-[100px]", className)}
      style={{
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        opacity
      }}
    />
  );
};

export const NoiseTexture = ({ className, opacity = 0.04 }) => {
  return (
    <div 
      className={cn("absolute inset-0 z-0 pointer-events-none mix-blend-overlay", className)}
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        opacity,
      }}
    />
  );
};

export const PageBackground = ({ children, withGlows = true }) => {
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GridOverlay />
        {withGlows && (
          <>
            <RadialGlow className="top-[-20%] left-[-10%] w-[50%] h-[50%]" />
            <RadialGlow className="bottom-[-20%] right-[-10%] w-[60%] h-[60%]" color="hsl(var(--success))" opacity={0.1} />
          </>
        )}
        <NoiseTexture />
      </div>
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
