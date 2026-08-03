import React from 'react';
import { SampleTestCard } from "@/components/common/SampleTestCard";

export const ProblemPanel = ({ problem, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-6 h-full flex flex-col gap-4">
        <div className="h-8 w-3/4 bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-white/5 rounded animate-pulse" />
        <div className="h-32 w-full bg-white/5 rounded animate-pulse mt-8" />
      </div>
    );
  }

  if (!problem) {
    return <div className="p-6 text-muted-foreground">Problem data could not be loaded.</div>;
  }

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar bg-background">
      <div className="max-w-3xl mx-auto space-y-12 pb-24">
        
        {/* Description Section */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-foreground/90">Description</h2>
          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {problem.statement}
          </div>
        </section>

        {/* Input / Output Formats */}
        <section className="space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground/80">Input Format</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground text-sm whitespace-pre-wrap">
              {problem.input_format}
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-3 text-foreground/80">Output Format</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground text-sm whitespace-pre-wrap">
              {problem.output_format}
            </div>
          </div>
        </section>

        {/* Constraints Section */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-foreground/80">Constraints</h2>
          <div className="prose prose-invert max-w-none text-muted-foreground text-sm whitespace-pre-wrap">
            {problem.constraints}
          </div>
        </section>

        {/* Sample Tests Section (Examples) */}
        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground/90">Examples</h2>
          {problem.sample_tests && problem.sample_tests.length > 0 ? (
            <div className="flex flex-col gap-6">
              {problem.sample_tests.map((test, idx) => (
                <div key={test.id || idx} className="space-y-2">
                  <h3 className="text-sm font-medium text-foreground/60">Sample {idx + 1}</h3>
                  <SampleTestCard 
                    input={test.input_data} 
                    output={test.expected_output} 
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
  );
};
