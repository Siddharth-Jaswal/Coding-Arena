import React from "react";
import { cn } from "@/lib/utils";
import { Button, IconButton } from "./Button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Simplified pagination logic for demonstration
  const visiblePages = pages.length > 5 
    ? [1, currentPage > 2 && '...', currentPage > 1 && currentPage, currentPage < totalPages && '...', totalPages].filter(Boolean)
    : pages;

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <IconButton 
        icon={ChevronLeft} 
        variant="outline" 
        size="iconSm" 
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      />
      {pages.map((p, idx) => {
        if (p === '...') {
          return <span key={`ellipsis-${idx}`} className="text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></span>;
        }
        return (
          <Button 
            key={p} 
            variant={currentPage === p ? "primary" : "ghost"} 
            size="iconSm"
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        );
      })}
      <IconButton 
        icon={ChevronRight} 
        variant="outline" 
        size="iconSm" 
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      />
    </div>
  );
};
