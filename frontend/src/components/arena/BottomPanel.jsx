import React, { useState } from 'react';
import { cn } from '@/lib/utils';

export const BottomPanel = ({ tabs = [], defaultTab = 0, className, activeTab: externalActiveTab, onTabChange }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab);
  
  const activeTab = externalActiveTab !== undefined ? externalActiveTab : internalActiveTab;
  
  const handleTabChange = (idx) => {
    if (onTabChange) {
      onTabChange(idx);
    } else {
      setInternalActiveTab(idx);
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-[#0a0a0a] border-t border-border/40", className)}>
      {/* Pluggable TabBar */}
      <div className="flex items-center gap-1 px-2 border-b border-border/40 bg-card/20 overflow-x-auto custom-scrollbar">
        {tabs.map((tab, idx) => {
          const isActive = activeTab === idx;
          return (
            <button
              key={idx}
              onClick={() => handleTabChange(idx)}
              className={cn(
                "px-4 py-2 text-xs font-medium transition-colors border-b-2 whitespace-nowrap",
                isActive 
                  ? "border-primary text-foreground bg-white/5" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2">
                {tab.icon && <tab.icon size={14} className={isActive ? "text-primary" : ""} />}
                {tab.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {tabs[activeTab]?.content || (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground italic">
            Nothing to display.
          </div>
        )}
      </div>
    </div>
  );
};
