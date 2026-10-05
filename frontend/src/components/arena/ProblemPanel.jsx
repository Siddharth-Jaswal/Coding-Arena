import React, { useState } from 'react';
import { BookOpen, History, Layers } from 'lucide-react';
import { SampleTestCard } from "@/components/common/SampleTestCard";
import { SubmissionsTab } from '@/components/arena/SubmissionsTab';

export const ProblemPanel = ({ problem, isLoading }) => {
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'submissions'
  const [submissionCount, setSubmissionCount] = useState(null);

  if (isLoading) {
    return (
      <div className="p-6 h-full flex flex-col gap-4 bg-background">
        <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
        <div className="h-32 w-full bg-white/5 rounded animate-pulse mt-8" />
      </div>
    );
  }

  if (!problem) {
    return <div className="p-6 text-muted-foreground bg-background h-full">Problem data could not be loaded.</div>;
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Top Tab Bar (LeetCode Style) */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 bg-neutral-950/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'description'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <BookOpen size={13} className={activeTab === 'description' ? 'text-primary' : ''} />
            <span>Description</span>
          </button>

          <button
            onClick={() => setActiveTab('submissions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'submissions'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <History size={13} className={activeTab === 'submissions' ? 'text-primary' : ''} />
            <span>Submissions</span>
            {submissionCount != null && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-none ${
                activeTab === 'submissions' 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'bg-white/10 text-neutral-400'
              }`}>
                {submissionCount}
              </span>
            )}
          </button>
        </div>

        {problem.difficulty && (
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
            problem.difficulty.toLowerCase() === 'easy'
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
              : problem.difficulty.toLowerCase() === 'medium'
              ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
              : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
          }`}>
            {problem.difficulty}
          </span>
        )}
      </div>

      {/* Tab Content Views */}
      <div className="flex-1 overflow-hidden min-h-0 relative">
        <div className={`h-full ${activeTab === 'submissions' ? 'block' : 'hidden'}`}>
          <SubmissionsTab 
            problemId={problem.id} 
            onSubmissionsLoaded={setSubmissionCount} 
          />
        </div>

        <div className={`h-full overflow-y-auto custom-scrollbar p-6 ${activeTab === 'description' ? 'block' : 'hidden'}`}>
          <div className="max-w-3xl mx-auto space-y-10 pb-24">
            
            {/* Description Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 text-foreground/90">Description</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm">
                {problem.statement}
              </div>
            </section>

            {/* Input / Output Formats */}
            <section className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold mb-2.5 text-foreground/80 uppercase tracking-wider text-xs">
                  Input Format
                </h3>
                <div className="prose prose-invert max-w-none text-muted-foreground text-sm whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  {problem.input_format}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2.5 text-foreground/80 uppercase tracking-wider text-xs">
                  Output Format
                </h3>
                <div className="prose prose-invert max-w-none text-muted-foreground text-sm whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5">
                  {problem.output_format}
                </div>
              </div>
            </section>

            {/* Constraints Section */}
            <section>
              <h3 className="text-sm font-semibold mb-2.5 text-foreground/80 uppercase tracking-wider text-xs">
                Constraints
              </h3>
              <div className="prose prose-invert max-w-none text-muted-foreground text-sm whitespace-pre-wrap bg-white/[0.02] p-4 rounded-xl border border-white/5 font-mono">
                {problem.constraints}
              </div>
            </section>

            {/* Sample Tests Section (Examples) */}
            <section>
              <h2 className="text-lg font-bold mb-4 text-foreground/90">Examples</h2>
              {problem.sample_tests && problem.sample_tests.length > 0 ? (
                <div className="flex flex-col gap-5">
                  {problem.sample_tests.map((test, idx) => (
                    <div key={test.id || idx} className="space-y-2">
                      <h4 className="text-xs font-semibold text-neutral-400">Example {idx + 1}</h4>
                      <SampleTestCard 
                        input={test.input || test.input_data} 
                        output={test.output || test.expected_output} 
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No sample tests available.</div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};
