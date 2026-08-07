import React, { useState, useEffect } from 'react';
import { SplitPane } from '@/components/layout';
import { EditorCard, ConsoleCard } from '@/components/common/DomainCards';
import { Card } from '@/components/ui/Card';
import { VerdictBadge } from '@/components/common/Badges';
import { motion } from 'framer-motion';

const PlayerHeader = ({ name, elo, isLeft }) => (
  <div className={`flex items-center gap-3 ${!isLeft ? 'flex-row-reverse' : ''}`}>
    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
      {name.charAt(0)}
    </div>
    <div className={`flex flex-col ${!isLeft ? 'items-end' : ''}`}>
      <span className="text-sm font-semibold text-foreground">{name}</span>
      <span className="text-xs text-muted-foreground">{elo} ELO</span>
    </div>
  </div>
);

export const LiveBattleShowcase = () => {
  const [code, setCode] = useState("");
  const fullCode = "function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n}";
  
  // Simulate typing effect for Player 1
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setCode(fullCode.substring(0, index));
      index++;
      if (index > fullCode.length) {
        clearInterval(interval);
      }
    }, 50); // fast typing
    return () => clearInterval(interval);
  }, []);

  const [consoleOutput, setConsoleOutput] = useState("> Compiling...\n");
  
  // Simulate console output for Player 2
  useEffect(() => {
    const sequence = [
      { t: 1000, msg: "> Compiling...\n> Running Test Cases...\n" },
      { t: 2500, msg: "> Compiling...\n> Running Test Cases...\n> Test 1: Passed (12ms)\n" },
      { t: 3200, msg: "> Compiling...\n> Running Test Cases...\n> Test 1: Passed (12ms)\n> Test 2: Passed (8ms)\n" },
      { t: 4000, msg: "> Compiling...\n> Running Test Cases...\n> Test 1: Passed (12ms)\n> Test 2: Passed (8ms)\n> Hidden Tests: Passed (42ms)\n\n[SUCCESS] All test cases passed!" }
    ];
    
    sequence.forEach(({ t, msg }) => {
      setTimeout(() => setConsoleOutput(msg), t);
    });
  }, []);

  const player1Panel = (
    <div className="flex flex-col h-full gap-2 p-2 pt-0">
      <PlayerHeader name="AlexDev" elo="1450" isLeft={true} />
      <EditorCard language="JavaScript" className="flex-1 min-h-[300px]">
        <div className="p-4 relative">
          <pre className="text-primary/90">
            <code>{code}</code>
            <motion.span 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-primary align-middle ml-1"
            />
          </pre>
        </div>
      </EditorCard>
    </div>
  );

  const player2Panel = (
    <div className="flex flex-col h-full gap-2 p-2 pt-0">
      <PlayerHeader name="ByteMaster" elo="1420" isLeft={false} />
      <div className="flex-1 flex flex-col gap-2 min-h-[300px]">
        <EditorCard language="C++" className="h-[60%] opacity-70 grayscale">
          <div className="p-4">
            <pre className="text-muted-foreground/50">
              <code>{`class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> m;\n        for (int i=0;; ++i) {\n            auto it = m.find(target - nums[i]);\n            if (it != m.end()) \n                return vector<int> {it->second, i};\n            m[nums[i]] = i;\n        }\n    }\n};`}</code>
            </pre>
          </div>
        </EditorCard>
        <ConsoleCard 
          status={consoleOutput.includes('SUCCESS') ? 'idle' : 'running'} 
          output={consoleOutput}
          className="h-[40%] flex-shrink-0"
        />
      </div>
    </div>
  );

  return (
    <Card variant="glass" className="w-full shadow-glow-primary overflow-visible border-primary/20">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center px-4 py-2 border-b border-border/50 bg-background/50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">Live Match #84291</span>
          </div>
          <div className="font-mono text-sm font-medium text-foreground">
            18:42
          </div>
          <div>
            <VerdictBadge verdict={consoleOutput.includes('SUCCESS') ? 'accepted' : 'pending'} />
          </div>
        </div>
        
        <div className="relative bg-background rounded-lg border border-border/50 h-[450px]">
          {/* Centered VS Badge */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
            <div className="relative w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.8)]">
              <div className="absolute inset-0 rounded-full border-gradient" />
              <span className="font-bold text-xs italic text-primary drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">VS</span>
            </div>
          </div>
          
          <SplitPane 
            direction="horizontal"
            defaultSize={500}
            leftPane={player1Panel}
            rightPane={player2Panel}
            className="p-2"
          />
        </div>
      </div>
    </Card>
  );
};
