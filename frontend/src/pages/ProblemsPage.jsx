import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { problemApi } from "@/api/problems";
import { PageWrapper, Container, Stack, GridLayout } from "@/components/layout";
import { SearchBar, Select } from "@/components/ui/Forms";
import { Skeleton } from "@/components/ui/Skeleton";
import { Pagination } from "@/components/ui/Pagination";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { ProblemCard, DifficultyBadge, EmptyState, ErrorState } from "@/components/common";
import { Link } from "react-router-dom";
import { Code2, SearchX } from "lucide-react";
import { motion } from "framer-motion";
import { fadeSlideUp, staggerChildren } from "@/lib/motion";
import { Button } from "@/components/ui/Button";

// Custom hook for debouncing search input
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const ITEMS_PER_PAGE = 10;

const ProblemsPage = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [difficulty, setDifficulty] = useState("all");
  const [tag, setTag] = useState("all");
  const [page, setPage] = useState(1);

  const {
    data: problems = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["problems"],
    queryFn: () => problemApi.getProblems(),
  });

  // Extract unique tags from the data
  const allTags = useMemo(() => {
    const tags = new Set();
    problems.forEach((p) => p.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [problems]);

  // Frontend Filtering
  const filteredProblems = useMemo(() => {
    return problems.filter((p) => {
      const matchesSearch = p.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.id.toString() === debouncedSearch;
      const matchesDiff = difficulty === "all" || p.difficulty.toLowerCase() === difficulty.toLowerCase();
      const matchesTag = tag === "all" || (p.tags && p.tags.includes(tag));
      return matchesSearch && matchesDiff && matchesTag;
    });
  }, [problems, debouncedSearch, difficulty, tag]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProblems.length / ITEMS_PER_PAGE) || 1;
  const paginatedProblems = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredProblems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProblems, page]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, difficulty, tag]);

  const difficultyOptions = [
    { label: "All Difficulties", value: "all" },
    { label: "Easy", value: "easy" },
    { label: "Medium", value: "medium" },
    { label: "Hard", value: "hard" },
  ];

  const tagOptions = [
    { label: "All Tags", value: "all" },
    ...allTags.map((t) => ({ label: t, value: t })),
  ];

  return (
    <PageWrapper withBackground>
      <Container className="py-12 md:py-24 max-w-5xl">
        <Stack gap={8} align="stretch">
          {/* Header */}
          <motion.div initial="initial" animate="animate" variants={fadeSlideUp} className="text-center max-w-2xl mx-auto mb-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tightest mb-4">Problem Bank</h1>
            <p className="text-muted-foreground text-lg">
              Sharpen your algorithms. Face real-world constraints. Climb the ranks.
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div initial="initial" animate="animate" variants={fadeSlideUp} className="relative z-20">
            <div className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-md">
              <div className="flex-1">
                <SearchBar
                  placeholder="Search by title or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <Select
                  value={difficulty}
                  onChange={(val) => setDifficulty(val)}
                  options={difficultyOptions}
                  className="w-full md:w-48"
                />
                <Select
                  value={tag}
                  onChange={(val) => setTag(val)}
                  options={tagOptions}
                  className="w-full md:w-48"
                />
              </div>
            </div>
          </motion.div>

          {/* Content Area */}
          {isLoading ? (
            <Stack gap={4}>
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </Stack>
          ) : isError ? (
            <ErrorState message={error?.message || "Failed to load problems."}>
              <Button onClick={() => refetch()} variant="outline">Try Again</Button>
            </ErrorState>
          ) : filteredProblems.length === 0 ? (
            <EmptyState icon={SearchX} title="No problems found" description="Adjust your search or filter criteria." />
          ) : (
            <motion.div initial="initial" animate="animate" variants={staggerChildren}>
              {/* Desktop Table (Hidden on small screens) */}
              <div className="hidden md:block rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/20">
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="w-32 text-right">Difficulty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProblems.map((p) => (
                      <TableRow key={p.id} className="group">
                        <TableCell className="font-mono text-muted-foreground">{p.id}</TableCell>
                        <TableCell>
                          <Link to={`/problems/${p.id}`} className="font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                            <Code2 size={16} className="text-muted-foreground group-hover:text-primary" />
                            {p.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2 flex-wrap">
                            {p.tags?.map(t => (
                              <span key={t} className="px-2 py-0.5 rounded text-xs bg-white/5 border border-white/10 text-muted-foreground">
                                {t}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DifficultyBadge difficulty={p.difficulty} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards (Hidden on md+ screens) */}
              <GridLayout cols={1} className="md:hidden">
                {paginatedProblems.map((p) => (
                  <ProblemCard key={p.id} problem={p} />
                ))}
              </GridLayout>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </motion.div>
          )}
        </Stack>
      </Container>
    </PageWrapper>
  );
};

export default ProblemsPage;
