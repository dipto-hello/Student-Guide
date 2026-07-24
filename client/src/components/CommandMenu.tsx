import React, { useEffect, useState, useTransition } from "react";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Search, Monitor, Moon, Sun, Calculator, Keyboard, BookOpen, MessageSquare, Timer, BarChart3, Users } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [, setLocation] = useLocation();
  const [, startTransition] = useTransition();
  const { theme, toggleTheme, switchable } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(console.error);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const navigateTo = (path: string) => {
    runCommand(() => {
      startTransition(() => {
        setLocation(path);
      });
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog 
          open={open} 
          onOpenChange={setOpen} 
          label="Global Command Menu"
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full max-w-lg mx-4"
          >
            <div className="premium-card rounded-xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 flex flex-col bg-white/70 dark:bg-slate-900/70">
              <div className="flex items-center px-4 py-3 border-b border-white/10 dark:border-white/5">
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <Command.Input 
                  placeholder="Type a command or search..." 
                  className="flex-1 bg-transparent text-foreground outline-none border-none placeholder:text-muted-foreground text-base"
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  autoFocus
                />
              </div>
              
              <Command.List className="max-h-[300px] overflow-y-auto p-2 scroll-smooth">
                <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                  {searchQuery ? "No results found." : "Type to search..."}
                </Command.Empty>
                
                {searchResults.length > 0 && (
                  <Command.Group heading="Search Results" className="px-2 py-1 text-xs font-semibold text-muted-foreground mb-1">
                    {searchResults.map((result: any) => (
                      <Command.Item 
                        key={result.id}
                        onSelect={() => navigateTo(result.path)}
                        className="flex items-center px-2 py-2.5 mt-1 rounded-md text-sm text-foreground cursor-pointer hover:bg-primary/10 aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                      >
                        {result.icon === 'Calculator' && <Calculator className="w-4 h-4 mr-2" />}
                        {result.icon === 'Keyboard' && <Keyboard className="w-4 h-4 mr-2" />}
                        {result.icon === 'Timer' && <Timer className="w-4 h-4 mr-2" />}
                        {result.icon === 'Users' && <Users className="w-4 h-4 mr-2" />}
                        {result.icon === 'BookOpen' && <BookOpen className="w-4 h-4 mr-2" />}
                        {result.icon === 'BarChart3' && <BarChart3 className="w-4 h-4 mr-2" />}
                        {result.title}
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {!searchQuery && (
                  <Command.Group heading="Navigation" className="px-2 py-1 text-xs font-semibold text-muted-foreground mb-1">
                    <Command.Item 
                      onSelect={() => navigateTo("/")}
                      className="flex items-center px-2 py-2.5 mt-1 rounded-md text-sm text-foreground cursor-pointer hover:bg-blue-500/10 aria-selected:bg-blue-500/10 aria-selected:text-blue-600 dark:aria-selected:text-blue-400 transition-colors"
                    >
                      <Monitor className="w-4 h-4 mr-2" /> Home Dashboard
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => navigateTo("/pomodoro")}
                      className="flex items-center px-2 py-2.5 mt-1 rounded-md text-sm text-foreground cursor-pointer hover:bg-orange-500/10 aria-selected:bg-orange-500/10 aria-selected:text-orange-600 dark:aria-selected:text-orange-400 transition-colors"
                    >
                      <Timer className="w-4 h-4 mr-2" /> Pomodoro Timer
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => navigateTo("/analytics")}
                      className="flex items-center px-2 py-2.5 mt-1 rounded-md text-sm text-foreground cursor-pointer hover:bg-green-500/10 aria-selected:bg-green-500/10 aria-selected:text-green-600 dark:aria-selected:text-green-400 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4 mr-2" /> Student Analytics
                    </Command.Item>
                  </Command.Group>
                )}

                {!searchQuery && (
                  <Command.Group heading="Tools" className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2 mb-1">
                    <Command.Item 
                      onSelect={() => navigateTo("/")}
                      className="flex items-center px-2 py-2.5 mt-1 rounded-md text-sm text-foreground cursor-pointer hover:bg-purple-500/10 aria-selected:bg-purple-500/10 aria-selected:text-purple-600 dark:aria-selected:text-purple-400 transition-colors"
                    >
                      <Calculator className="w-4 h-4 mr-2" /> CGPA Calculator
                    </Command.Item>
                    <Command.Item 
                      onSelect={() => navigateTo("/")}
                      className="flex items-center px-2 py-2.5 mt-1 rounded-md text-sm text-foreground cursor-pointer hover:bg-pink-500/10 aria-selected:bg-pink-500/10 aria-selected:text-pink-600 dark:aria-selected:text-pink-400 transition-colors"
                    >
                      <Keyboard className="w-4 h-4 mr-2" /> Typing Test
                    </Command.Item>
                  </Command.Group>
                )}

                {!searchQuery && switchable && (
                  <Command.Group heading="Settings" className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2 mb-1">
                    <Command.Item 
                      onSelect={() => runCommand(() => toggleTheme && toggleTheme())}
                      className="flex items-center px-2 py-2.5 mt-1 rounded-md text-sm text-foreground cursor-pointer hover:bg-gray-500/10 aria-selected:bg-gray-500/10 transition-colors"
                    >
                      {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />} 
                      Toggle Theme
                    </Command.Item>
                  </Command.Group>
                )}
              </Command.List>
            </div>
          </motion.div>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}
