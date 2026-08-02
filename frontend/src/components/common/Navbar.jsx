import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/Button";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tighter text-foreground">CODING<span className="text-primary">ARENA</span></span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Game Modes
            </Link>
            <Link to="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Leaderboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Login</Button>
          <Button size="sm">Find Match</Button>
        </div>
      </div>
    </header>
  );
};
