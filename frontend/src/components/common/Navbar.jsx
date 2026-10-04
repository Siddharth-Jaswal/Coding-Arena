import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import { SOCKET_STATUS } from "@/socket/events";
import { Swords, Wifi, WifiOff, Loader2, Menu, X, LayoutDashboard, Code2, User, LogOut, LogIn, UserPlus } from "lucide-react";

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
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold tracking-tighter text-foreground">
              CODING<span className="text-primary">ARENA</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
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
                <a 
                  href="/#game-modes" 
                  onClick={(e) => {
                    const el = document.getElementById('game-modes');
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Game Modes
                </a>
                <Link to="#" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors opacity-50 cursor-not-allowed" title="Coming Soon">
                  Leaderboard
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button size="sm" className="hidden sm:inline-flex" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          ) : (
            <>
              <ConnectionIndicator />
              <Button
                variant="outline"
                size="sm"
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

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b border-border/60 bg-background/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-5 py-4 space-y-3">
              {/* User summary if authenticated */}
              {isAuthenticated && user && (
                <div className="pb-3 border-b border-border/40 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">Signed in as</span>
                    <span className="text-sm font-bold text-foreground">{user.username}</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
                    {user.rating || 1500} pts
                  </span>
                </div>
              )}

              {/* Navigation links */}
              <div className="space-y-1 pt-1">
                {isAuthenticated ? (
                  <>
                    <Button
                      className="w-full justify-start gap-2 bg-gradient-to-r from-primary to-indigo-600 text-white font-bold mb-3 shadow-md"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate('/matchmaking');
                      }}
                    >
                      <Swords size={16} />
                      Queue Up / Find Match
                    </Button>

                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/90 hover:bg-white/5 transition-colors"
                    >
                      <LayoutDashboard size={17} className="text-primary" />
                      Dashboard
                    </Link>

                    <Link
                      to="/problems"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/90 hover:bg-white/5 transition-colors"
                    >
                      <Code2 size={17} className="text-primary" />
                      Problems
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/90 hover:bg-white/5 transition-colors"
                    >
                      <User size={17} className="text-primary" />
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut size={17} />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/problems"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground/90 hover:bg-white/5 transition-colors"
                    >
                      <Code2 size={17} className="text-primary" />
                      Problems
                    </Link>

                    <div className="pt-2 grid grid-cols-2 gap-2">
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                          <LogIn size={15} />
                          Login
                        </Link>
                      </Button>
                      <Button className="w-full gap-2" asChild>
                        <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                          <UserPlus size={15} />
                          Register
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
