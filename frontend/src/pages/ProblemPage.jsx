import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { problemApi } from "@/api/problems";
import { PageWrapper, Container, Stack, GridLayout } from "@/components/layout";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState, DifficultyBadge, SampleTestCard } from "@/components/common";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Clock, HardDrive, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { fadeSlideUp, staggerChildren } from "@/lib/motion";

const ProblemPage = () => {
  const { id } = useParams();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["problem", id],
    queryFn: () => problemApi.getProblem(id),
    retry: 1
  });

  if (isLoading) {
    return (
      <PageWrapper withBackground>
        <Container className="py-8">
          <Stack gap={6}>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-64 w-full" />
          </Stack>
        </Container>
      </PageWrapper>
    );
  }

  if (isError) {
    return (
      <PageWrapper withBackground>
        <Container className="py-24">
          <ErrorState message={error?.message || "Failed to load problem details."}>
            <div className="flex gap-4">
              <Button onClick={() => refetch()} variant="outline">Try Again</Button>
              <Link to="/problems">
                <Button variant="ghost">Back to Problems</Button>
              </Link>
            </div>
          </ErrorState>
        </Container>
      </PageWrapper>
    );
  }

  if (!data || !data.problem) {
    return null; // Fallback handled by ErrorState if 404
  }

  const { problem, sample_tests } = data;

  return (
    <PageWrapper withBackground>
      <Container className="py-8 md:py-12 max-w-4xl">
        <motion.div initial="initial" animate="animate" variants={staggerChildren}>
          <Stack gap={8} align="stretch">
            {/* Breadcrumbs / Back Navigation */}
            <motion.div variants={fadeSlideUp}>
              <Link to="/problems" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft size={16} /> Back to Problems
              </Link>
            </motion.div>

            {/* Header & Metadata */}
            <motion.div variants={fadeSlideUp} className="border-b border-border/50 pb-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    {problem.id}. {problem.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4">
                    <DifficultyBadge difficulty={problem.difficulty} />
                    {problem.tags?.map((t) => (
                      <span key={t} className="flex items-center gap-1 text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-md text-muted-foreground">
                        <Tag size={12} /> {t}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Submit Placeholder for future */}
                <Button size="lg" className="shadow-glow-primary">
                  Solve Challenge
                </Button>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground bg-card/30 p-4 rounded-xl border border-border/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-primary" />
                  Time Limit: <span className="font-mono text-foreground">{problem.time_limit_ms}ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive size={16} className="text-primary" />
                  Memory Limit: <span className="font-mono text-foreground">{problem.memory_limit_mb}MB</span>
                </div>
              </div>
            </motion.div>

            {/* Problem Statement */}
            <motion.div variants={fadeSlideUp}>
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/30 prose-pre:border prose-pre:border-border/30">
                <h3 className="text-xl font-semibold mb-4 text-foreground">Statement</h3>
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {problem.statement}
                </div>
              </div>
            </motion.div>

            {/* Input / Output Formats */}
            <motion.div variants={fadeSlideUp}>
              <GridLayout cols={2} gap={6}>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Input Format</h4>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/10">
                    {problem.input_format}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Output Format</h4>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/10">
                    {problem.output_format}
                  </p>
                </div>
              </GridLayout>
            </motion.div>

            {/* Constraints */}
            <motion.div variants={fadeSlideUp}>
              <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Constraints</h4>
              <ul className="list-inside list-disc space-y-1 text-sm text-foreground/80 bg-white/5 p-4 rounded-lg border border-white/10 font-mono">
                {problem.constraints?.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </motion.div>

            {/* Sample Tests */}
            <motion.div variants={fadeSlideUp} className="pt-4 border-t border-border/50">
              <h3 className="text-xl font-semibold mb-6 text-foreground">Sample Tests</h3>
              <GridLayout cols={2} gap={6}>
                {sample_tests?.map((test, index) => (
                  <SampleTestCard key={index} index={index} input={test.input} output={test.output} />
                ))}
              </GridLayout>
            </motion.div>

          </Stack>
        </motion.div>
      </Container>
    </PageWrapper>
  );
};

export default ProblemPage;
