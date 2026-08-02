import React from "react";
import { Card, CardContent } from "../ui/Card";
import { DifficultyBadge } from "./Badges";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { hoverLift } from "@/lib/motion";

export const ProblemCard = ({ problem }) => {
  return (
    <motion.div {...hoverLift}>
      <Link to={`/problems/${problem.id}`}>
        <Card variant="glass" className="h-full transition-colors hover:bg-white/10 group cursor-pointer">
          <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {problem.title}
              </h3>
              <DifficultyBadge difficulty={problem.difficulty} />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {problem.description || "Solve this coding challenge to improve your rating."}
            </p>
            <div className="text-xs text-muted-foreground/60 pt-2 border-t border-border/50">
              ID: {problem.id}
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
};
