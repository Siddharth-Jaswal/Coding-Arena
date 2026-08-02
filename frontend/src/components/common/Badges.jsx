import React from "react";
import { Badge } from "../ui/Badge";

export const DifficultyBadge = ({ difficulty }) => {
  const map = {
    easy: "success",
    medium: "default",
    hard: "destructive",
  };
  const variant = map[difficulty] || "default";
  const label = difficulty ? difficulty.charAt(0).toUpperCase() + difficulty.slice(1) : "Unknown";

  return <Badge variant={variant}>{label}</Badge>;
};

export const VerdictBadge = ({ verdict }) => {
  const map = {
    accepted: "success",
    pending: "secondary",
    wrong_answer: "destructive",
    runtime_error: "destructive",
    time_limit_exceeded: "destructive",
    compilation_error: "destructive",
  };
  const variant = map[verdict] || "outline";
  const label = verdict 
    ? verdict.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Unknown";

  return <Badge variant={variant}>{label}</Badge>;
};
