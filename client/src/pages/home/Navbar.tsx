import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import {
  GraduationCap,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Sparkles,
  Sun,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { NAV_ITEMS, NAV_LABELS } from "./data";

/**
 * Fixed top navigation for the landing page.
 *
 * Owns its own mobile-menu state — nothing outside the nav needs it, and
 * keeping it local avoids re-rendering every section when the menu toggles.
 */
export const Navbar = memo(function Navbar({
  scrolled,
  onNavigateToSection,
  onOpenAuth,
}: {
  scrolled: boolean;
  onNavigateToSection: (id: string) => void;
  onOpenAuth: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  const handleNavClick = (id: string) => {
    setIsMobileMenuOpen(false);
    onNavigateToSection(id);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed w-full top-0 z-50 transition-colors duration-300 ${
        scrolled || isMobileMenuOpen ? "nav-surface" : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container px-4 flex items-center justify-between h-16 gap-2 sm:gap-4">
        <button
          className="flex items-center gap-2 sm:gap-2.5 group shrink-0"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Scroll to top"
        >
          <span className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
            <GraduationCap className="w-5 h-5 sm:w-5 sm:h-5 text-white" aria-hidden="true" />
          </span>
          <span className="font-bold text-base sm:text-lg text-foreground whitespace-nowrap">
            Student Hub
          </span>
        </button>

        <div className="hidden md:flex items-center gap-5 lg:gap-8 shrink" role="menubar">
          {NAV_ITEMS.map((item) => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className="text-foreground/70 hover:text-primary transition-colors text-sm font-semibold capitalize whitespace-nowrap"
              aria-label={`Navigate to ${item}`}
              role="menuitem"
            >
              {NAV_LABELS[item] || item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={toggleTheme}
            className="theme-toggle shrink-0 p-1.5 sm:p-2"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            <motion.div
              initial={false}
              animate={{ rotate: theme === "dark" ? 180 : 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" aria-hidden="true" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" aria-hidden="true" />
              )}
            </motion.div>
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                onClick={() => setLocation("/profile")}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-accent/50 border border-border/50 hover:bg-accent transition-colors cursor-pointer"
                title="Go to Profile"
              >
                <img
                  src={
                    user.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`
                  }
                  alt={user.name}
                  className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-primary/30"
                />
                <span className="text-[11px] sm:text-xs font-bold text-foreground hidden sm:inline max-w-[90px] truncate">
                  {user.name.split(" ")[0]}
                </span>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={onOpenAuth}
              variant="outline"
              className="h-8 sm:h-9 px-2.5 sm:px-4 rounded-xl text-[11px] sm:text-xs font-semibold border-border hover:bg-accent flex items-center gap-1 sm:gap-1.5 whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sign In</span>
            </Button>
          )}

          <button
            className="md:hidden p-1.5 sm:p-2 text-foreground/70 hover:text-primary transition-colors shrink-0 -mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
            )}
          </button>

          <Button
            className="hidden lg:flex cta-primary h-9 px-4 lg:px-5 rounded-xl text-xs lg:text-sm border-0 whitespace-nowrap shrink-0"
            onClick={() => handleNavClick("tools")}
          >
            Explore Tools
            <Sparkles className="ml-1.5 w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 left-0 right-0 nav-surface border-t border-border p-4 shadow-xl"
            role="menu"
          >
            <div className="flex flex-col gap-3 text-center">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className="block py-2.5 text-foreground hover:text-primary font-medium capitalize w-full"
                  aria-label={`Navigate to ${item}`}
                  role="menuitem"
                >
                  {NAV_LABELS[item] || item}
                </button>
              ))}
              <Button
                className="w-full cta-primary h-10 rounded-xl border-0 mt-1"
                onClick={() => handleNavClick("tools")}
              >
                Explore Tools
                <Sparkles className="ml-1.5 w-4 h-4" aria-hidden="true" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
});
