import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { SOCKET_STATUS } from "@/socket/events";
import { Swords, Wifi, WifiOff, Loader2 } from "lucide-react";

const ConnectionIndicator = () => {
  const { status } = useSocket();
  
  if (status === SOCKET_STATUS.CONNECTED) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 px-2 py-1 bg-emerald-500/10 rounded-full" title="Connected to Server">
        <Wifi className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Connected</span>
      </div>
    );
  }
  if (status === SOCKET_STATUS.RECONNECTING || status === SOCKET_STATUS.CONNECTING) {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-yellow-500 px-2 py-1 bg-yellow-500/10 rounded-full" title="Connecting...">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="hidden sm:inline">Connecting</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-destructive px-2 py-1 bg-destructive/10 rounded-full" title="Offline">
      <WifiOff className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Offline</span>
    </div>
  );
};

export const Navbar = ({ variant = "landing" }) => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/60 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tighter text-foreground">CODING<span className="text-primary">ARENA</span></span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {variant === 'app' ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link to="/problems" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Problems
                </Link>
                <Link to="/profile" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
                <Link to="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors opacity-50 cursor-not-allowed" title="Coming Soon">
                  Leaderboard
                </Link>
              </>
            ) : (
              <>
                <Link to="/problems" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Problems
                </Link>
                <Link to="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Game Modes
                </Link>
                <Link to="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors opacity-50 cursor-not-allowed" title="Coming Soon">
                  Leaderboard
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          ) : (
            <>
              <ConnectionIndicator />
              <Button
                variant="outline"
                className="hidden sm:flex border-primary/20 text-primary hover:bg-primary/10 shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)] transition-all duration-300"
                onClick={() => navigate('/matchmaking')}
              >
                <Swords className="w-4 h-4 mr-2" />
                Find Match (Beta)
              </Button>
              {variant === 'landing' ? (
                <>
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                    <Link to="/profile">Profile</Link>
                  </Button>
                </>
              ) : null}
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:inline-flex text-muted-foreground hover:text-destructive">
                Logout
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
