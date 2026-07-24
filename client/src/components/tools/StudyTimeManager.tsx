import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Clock, 
  Zap, 
  Play, 
  Pause, 
  RotateCcw, 
  Brain, 
  Coffee, 
  Flame, 
  CheckCircle2, 
  History, 
  Sparkles, 
  Target,
  Award
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SessionRecord {
  id: string;
  type: "focus" | "break" | "long-break";
  timestamp: string;
  durationMinutes: number;
}

export default function StudyTimeManager() {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState<"focus" | "break" | "long-break">("focus");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([]);

  const focusTime = 25 * 60;
  const breakTime = 5 * 60;
  const longBreakTime = 30 * 60;

  const getTotalTime = () => {
    if (mode === "focus") return focusTime;
    if (mode === "break") return breakTime;
    return longBreakTime;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/user/study-sessions', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setSessionHistory(data);
            const completedFocus = data.filter((s: any) => s.type === "focus").length;
            setSessionsCompleted(completedFocus);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const saveSession = (type: string, durationMinutes: number, nowFormatted: string) => {
    setSessionHistory((prev) => [
      { id: Date.now().toString(), type: type as any, timestamp: nowFormatted, durationMinutes },
      ...prev,
    ]);

    if (isAuthenticated) {
      fetch('/api/user/study-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, durationMinutes }),
        credentials: 'include'
      }).catch(() => {});
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      if (mode === "focus") {
        const nextSessions = sessionsCompleted + 1;
        setSessionsCompleted(nextSessions);
        
        saveSession("focus", 25, nowFormatted);

        if (nextSessions % 4 === 0) {
          setMode("long-break");
          setTimeLeft(longBreakTime);
        } else {
          setMode("break");
          setTimeLeft(breakTime);
        }
      } else {
        saveSession(mode, mode === "break" ? 5 : 30, nowFormatted);

        setMode("focus");
        setTimeLeft(focusTime);
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, mode, sessionsCompleted]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMode("focus");
    setTimeLeft(focusTime);
  };

  const switchMode = (newMode: "focus" | "break" | "long-break") => {
    setIsRunning(false);
    setMode(newMode);
    if (newMode === "focus") setTimeLeft(focusTime);
    else if (newMode === "break") setTimeLeft(breakTime);
    else setTimeLeft(longBreakTime);
  };

  const getModeConfig = () => {
    switch (mode) {
      case "focus":
        return {
          label: "Focus Time",
          gradient: "from-blue-500 to-indigo-600",
          stroke: "#6366f1",
          glowColor: "rgba(99, 102, 241, 0.25)",
          badgeBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
          icon: Brain,
        };
      case "break":
        return {
          label: "Short Break",
          gradient: "from-emerald-500 to-teal-600",
          stroke: "#10b981",
          glowColor: "rgba(16, 185, 129, 0.25)",
          badgeBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
          icon: Coffee,
        };
      case "long-break":
        return {
          label: "Long Break",
          gradient: "from-amber-500 to-orange-600",
          stroke: "#f59e0b",
          glowColor: "rgba(245, 158, 11, 0.25)",
          badgeBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
          icon: Flame,
        };
    }
  };

  const modeConfig = getModeConfig();
  const ModeIcon = modeConfig.icon;
  
  const totalDuration = getTotalTime();
  const progressRatio = timeLeft / totalDuration;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const totalFocusMinutes = sessionHistory
    .filter((s) => s.type === "focus")
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-5">
      {/* Main Timer Card */}
      <div className="premium-card rounded-2xl p-5 md:p-6 shadow-lg border border-border/40 relative overflow-hidden flex flex-col items-center justify-center space-y-5">
        {/* Mode Selector Tabs */}
        <div className="flex p-1 rounded-xl bg-accent/50 border border-border/50 max-w-md w-full justify-between gap-1">
          <button
            onClick={() => switchMode("focus")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              mode === "focus"
                ? "bg-background text-indigo-500 shadow-sm border border-indigo-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Focus (25m)
          </button>

          <button
            onClick={() => switchMode("break")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              mode === "break"
                ? "bg-background text-emerald-500 shadow-sm border border-emerald-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Coffee className="w-3.5 h-3.5" /> Break (5m)
          </button>

          <button
            onClick={() => switchMode("long-break")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
              mode === "long-break"
                ? "bg-background text-amber-500 shadow-sm border border-amber-500/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> Long Break (30m)
          </button>
        </div>

        {/* Circular Progress Ring Timer */}
        <div className="relative flex items-center justify-center my-2">
          <svg className="w-60 h-60 transform -rotate-90" viewBox="0 0 240 240">
            <circle
              cx="120"
              cy="120"
              r={radius}
              className="stroke-zinc-200 dark:stroke-zinc-800/80"
              strokeWidth="10"
              fill="none"
            />
            <motion.circle
              cx="120"
              cy="120"
              r={radius}
              stroke={modeConfig.stroke}
              strokeWidth="10"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{
                filter: `drop-shadow(0 0 8px ${modeConfig.glowColor})`,
              }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border mb-1.5 ${modeConfig.badgeBg}`}>
              <ModeIcon className="w-3 h-3" /> {modeConfig.label}
            </span>

            <span className="text-4xl font-black font-mono tracking-tight text-foreground">
              {formatTime(timeLeft)}
            </span>

            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-zinc-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                {isRunning ? "Running" : "Paused"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 items-center justify-center pt-1">
          <Button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-6 py-2 h-10 text-white font-bold rounded-xl shadow-md transition-all bg-gradient-to-r ${modeConfig.gradient} hover:opacity-90 text-xs`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5" /> Start Timer
              </>
            )}
          </Button>

          <Button
            onClick={resetTimer}
            variant="outline"
            className="px-4 py-2 h-10 rounded-xl border-border text-muted-foreground hover:text-foreground hover:bg-accent text-xs"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Info & History Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Session Progress Card */}
        <div className="premium-card rounded-2xl p-5 shadow-lg border border-border/40 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sessions Completed</h4>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-accent text-foreground">
              {totalFocusMinutes} mins focused
            </span>
          </div>

          <div className="py-1 text-center">
            <p className="text-4xl font-black text-indigo-500 font-mono tracking-tight">{sessionsCompleted}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Pomodoro cycles finished</p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border/30">
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Current Cycle Progress</span>
              <span>{(sessionsCompleted % 4)} / 4 to Long Break</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((step) => {
                const isDone = (sessionsCompleted % 4) > step || (sessionsCompleted > 0 && sessionsCompleted % 4 === 0);
                return (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all ${
                      isDone
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                        : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Session History List Card */}
        <div className="premium-card rounded-2xl p-5 shadow-lg border border-border/40 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                <History className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Session History</h4>
            </div>
            {sessionHistory.length > 0 && (
              <button 
                onClick={() => setSessionHistory([])} 
                className="text-[11px] text-muted-foreground hover:text-rose-500 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
            {sessionHistory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">
                No sessions completed yet. Start the timer!
              </div>
            ) : (
              sessionHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-accent/40 border border-border/30 text-xs"
                >
                  <div className="flex items-center gap-2">
                    {item.type === "focus" && <Brain className="w-3.5 h-3.5 text-indigo-500" />}
                    {item.type === "break" && <Coffee className="w-3.5 h-3.5 text-emerald-500" />}
                    {item.type === "long-break" && <Flame className="w-3.5 h-3.5 text-amber-500" />}
                    <span className="font-semibold capitalize text-foreground">
                      {item.type.replace("-", " ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground font-mono">
                    <span>{item.durationMinutes} min</span>
                    <span className="text-[10px]">{item.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pro Tips Section */}
      <div className="premium-card rounded-2xl p-5 shadow-lg border border-border/40 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Zap className="w-4 h-4" />
          </div>
          <h4 className="font-bold text-xs uppercase tracking-wider text-foreground">Pro Tips for Maximum Productivity</h4>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-accent/30 border border-border/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Peak Hours:</strong> Schedule demanding study subjects during your natural energy peak hours.</span>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-accent/30 border border-border/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Zero Distractions:</strong> Turn off social media notifications and use blockers during focus sessions.</span>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-accent/30 border border-border/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Active Recall:</strong> Take notes in your own words and quiz yourself during review breaks.</span>
          </li>
          <li className="flex items-start gap-2 p-2.5 rounded-xl bg-accent/30 border border-border/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Spaced Repetition:</strong> Revisit complex material regularly over time to solidify long-term retention.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
