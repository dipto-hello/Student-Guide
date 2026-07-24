import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Target, Volume2, VolumeX, Gauge, Timer, AlertTriangle, Trophy, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStreaks } from "@/hooks/useStreaks";
import { useAuth } from "@/contexts/AuthContext";
import { Confetti } from "@/components/Confetti";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/* ──────────────────────────────────────────────────
   PASSAGE DATA — 25+ diverse passages by difficulty
   ────────────────────────────────────────────────── */
const passages: Record<"easy" | "medium" | "hard", string[]> = {
  easy: [
    "The quick brown fox jumps over the lazy dog near the river bank.",
    "A good student always tries to learn something new every single day.",
    "Practice makes perfect if you keep working hard and stay focused.",
    "The sun rises in the east and sets in the west every day without fail.",
    "Reading books is one of the best ways to expand your knowledge and grow.",
    "Hard work and dedication are the keys to achieving your dreams in life.",
    "Every journey begins with a single step forward into the unknown world.",
    "Music brings people together and creates beautiful memories that last forever.",
    "The stars shine brightly in the dark night sky above the sleeping city.",
  ],
  medium: [
    "Programming is the art of telling another human what one wants the computer to do efficiently.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts the most.",
    "First, solve the problem. Then, write the code. This is the golden rule of software engineering.",
    "Code is like humor. When you have to explain it, it is bad. Keep it simple and readable always.",
    "The best error message is the one that never shows up. Write defensive code from the very start.",
    "Debugging is twice as hard as writing the code in the first place. So write simple code always.",
    "Any fool can write code that a computer can understand. Good programmers write code humans understand.",
    "The most damaging phrase in any language is: We have always done it this way. Innovate constantly.",
    "Talk is cheap. Show me the code. Actions speak louder than words in the world of programming.",
  ],
  hard: [
    "In computer science, a binary search tree is a rooted binary tree data structure with the key of each internal node being greater than all the keys in the respective node's left subtree.",
    "The Model-View-Controller architectural pattern separates an application into three interconnected components: the model manages data logic, the view handles display, and the controller processes input.",
    "Polymorphism in object-oriented programming allows objects of different classes to be treated as objects of a common superclass, enabling flexible and extensible code architectures.",
    "Asynchronous JavaScript uses promises, callbacks, and the async/await syntax to handle operations that take an indeterminate amount of time without blocking the main execution thread.",
    "The time complexity of quicksort averages O(n log n) but degrades to O(n squared) in the worst case when the pivot selection consistently produces unbalanced partitions.",
    "Containerization with Docker encapsulates applications and their dependencies into lightweight, portable containers that can run consistently across different computing environments.",
    "Continuous integration and continuous deployment pipelines automate the process of building, testing, and deploying code changes, reducing manual errors and accelerating delivery cycles.",
  ],
};

type Difficulty = "easy" | "medium" | "hard";

const difficultyConfig = {
  easy: { label: "Easy", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  medium: { label: "Medium", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  hard: { label: "Hard", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30" },
};

/* ──────────────────────────────────────────────────
   WEB AUDIO SOUND EFFECTS
   ────────────────────────────────────────────────── */
let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

function playCorrectSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.04);
}

function playWrongSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(80, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function TypingSpeedWidget() {
  const { isAuthenticated } = useAuth();
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [textToType, setTextToType] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [liveWpm, setLiveWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalErrors, setTotalErrors] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [bestWpm, setBestWpm] = useState<number>(() => {
    return parseInt(localStorage.getItem("typing_best_wpm") || "0");
  });
  const [history, setHistory] = useState<{wpm: number, accuracy: number, date: string, difficulty: string}[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("typing_history") || "[]");
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const liveWpmInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const { recordActivity, unlockAchievement } = useStreaks();
  const [showConfetti, setShowConfetti] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showDifficultyMenu, setShowDifficultyMenu] = useState(false);

  const pickRandomText = useCallback((diff?: Difficulty) => {
    const d = diff || difficulty;
    const pool = passages[d];
    const text = pool[Math.floor(Math.random() * pool.length)];
    setTextToType(text);
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setLiveWpm(0);
    setAccuracy(100);
    setTotalErrors(0);
    setElapsedSeconds(0);
    if (liveWpmInterval.current) {
      clearInterval(liveWpmInterval.current);
      liveWpmInterval.current = null;
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [difficulty]);

  useEffect(() => {
    pickRandomText();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/user/typing-history', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const formatted = data.map((item: any) => ({
              wpm: item.wpm,
              accuracy: item.accuracy,
              difficulty: item.difficulty,
              date: new Date(item.createdAt).toLocaleDateString()
            }));
            setHistory(formatted);
            const maxWpm = Math.max(...formatted.map(item => item.wpm), bestWpm);
            if (maxWpm > bestWpm) {
              setBestWpm(maxWpm);
            }
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (startTime && !endTime) {
      const interval = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (startTime && !endTime) {
      liveWpmInterval.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 60000;
        if (elapsed > 0) {
          const wordsTyped = userInput.trim().split(/\s+/).filter(Boolean).length;
          setLiveWpm(Math.round(wordsTyped / elapsed) || 0);
        }
      }, 500);
      return () => {
        if (liveWpmInterval.current) clearInterval(liveWpmInterval.current);
      };
    }
  }, [startTime, endTime, userInput]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;

    if (val.length > textToType.length) return;

    if (!startTime && val.length > 0) {
      setStartTime(Date.now());
    }

    if (soundEnabled && val.length > userInput.length) {
      const lastIdx = val.length - 1;
      if (val[lastIdx] === textToType[lastIdx]) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }

    setUserInput(val);

    let correctChars = 0;
    let errors = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === textToType[i]) {
        correctChars++;
      } else {
        errors++;
      }
    }
    const currAccuracy = val.length === 0 ? 100 : Math.round((correctChars / val.length) * 100);
    setAccuracy(currAccuracy);
    setTotalErrors(errors);

    if (val === textToType) {
      const finishTime = Date.now();
      setEndTime(finishTime);

      const timeTakenMinutes = (finishTime - (startTime || finishTime)) / 60000;
      const wordCount = textToType.split(" ").length;
      const finalWpm = Math.round(wordCount / timeTakenMinutes);
      setWpm(finalWpm);
      setLiveWpm(finalWpm);

      let isNewPB = false;
      if (finalWpm > bestWpm && currAccuracy > 80) {
        setBestWpm(finalWpm);
        localStorage.setItem("typing_best_wpm", finalWpm.toString());
        if (finalWpm > 80) unlockAchievement("Speed Demon");
        isNewPB = true;
      }

      recordActivity();
      if (isNewPB) setShowConfetti(true);

      if (isAuthenticated) {
        fetch('/api/user/typing-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wpm: finalWpm, accuracy: currAccuracy, difficulty }),
          credentials: 'include'
        }).catch(() => {});
      }
      
      const newHistory = [
        { wpm: finalWpm, accuracy: currAccuracy, date: new Date().toLocaleDateString(), difficulty },
        ...history,
      ].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("typing_history", JSON.stringify(newHistory));
    }
  }, [textToType, userInput, startTime, soundEnabled, bestWpm, difficulty, history, recordActivity, unlockAchievement, isAuthenticated]);

  const clearData = () => {
    setBestWpm(0);
    setHistory([]);
    localStorage.removeItem("typing_best_wpm");
    localStorage.removeItem("typing_history");
  };

  const handleDifficultyChange = (d: Difficulty) => {
    setDifficulty(d);
    setShowDifficultyMenu(false);
    pickRandomText(d);
  };

  const isFinished = !!endTime;
  const progress = textToType.length > 0 ? Math.round((userInput.length / textToType.length) * 100) : 0;

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const renderText = useMemo(() => {
    return textToType.split("").map((char, index) => {
      let colorClass = "text-foreground/30";
      if (index < userInput.length) {
        colorClass = userInput[index] === char
          ? "text-emerald-500 font-semibold"
          : "text-rose-500 bg-rose-500/15 font-semibold rounded-sm";
      }
      const isCursor = index === userInput.length && !isFinished;
      return (
        <span key={index} className={colorClass}>
          {isCursor && (
            <span className="inline-block w-[2px] h-[1.1em] bg-primary animate-pulse align-text-bottom ml-[1px]" />
          )}
          {char}
        </span>
      );
    });
  }, [textToType, userInput, isFinished]);

  return (
    <div className="space-y-4">
      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

      {/* Control Bar */}
      <div className="flex flex-wrap justify-between items-center gap-2 pb-1 border-b border-border/40">
        <div className="relative">
          <button
            onClick={() => setShowDifficultyMenu(!showDifficultyMenu)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${difficultyConfig[difficulty].bg} ${difficultyConfig[difficulty].color} ${difficultyConfig[difficulty].border}`}
            aria-label="Select difficulty"
          >
            Level: {difficultyConfig[difficulty].label}
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <AnimatePresence>
            {showDifficultyMenu && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 top-full mt-1 z-20 premium-card rounded-xl overflow-hidden shadow-lg border border-border min-w-[120px]"
              >
                {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => handleDifficultyChange(d)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-primary/5 transition-colors ${
                      d === difficulty ? difficultyConfig[d].color : "text-foreground/70"
                    }`}
                  >
                    {difficultyConfig[d].label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {soundEnabled
              ? <Volume2 className="w-4 h-4 text-primary" aria-hidden="true" />
              : <VolumeX className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
            }
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-rose-500 border-rose-500/30 hover:bg-rose-500/10 h-8 text-xs px-2.5">
                Clear Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="premium-card border-border rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Typing Data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will delete your typing test history and best scores.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent text-foreground">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearData} className="bg-rose-500 text-white">Clear</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="ghost" size="icon" onClick={() => pickRandomText()} className="h-8 w-8" aria-label="New passage">
            <RefreshCw className="w-4 h-4 text-primary" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* ── Stats Grid (Clean 4-column layout with no text squeezing) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Speed WPM */}
        <div className="premium-card p-3 rounded-xl flex items-center gap-2.5">
          <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
            <Gauge className="w-4 h-4 text-indigo-500" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">WPM</p>
            <p className="text-lg font-black text-foreground leading-none mt-0.5">{isFinished ? wpm : (startTime ? liveWpm : "--")}</p>
          </div>
        </div>

        {/* Accuracy */}
        <div className="premium-card p-3 rounded-xl flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
            <Target className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">Accuracy</p>
            <p className="text-lg font-black text-foreground leading-none mt-0.5">{accuracy}%</p>
          </div>
        </div>

        {/* Errors */}
        <div className="premium-card p-3 rounded-xl flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/10 rounded-lg shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-500" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">Errors</p>
            <p className="text-lg font-black text-foreground leading-none mt-0.5">{totalErrors}</p>
          </div>
        </div>

        {/* Time / Best */}
        <div className="premium-card p-3 rounded-xl flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 rounded-lg shrink-0 relative">
            <Trophy className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider truncate">Best WPM</p>
            <p className="text-lg font-black text-foreground leading-none mt-0.5">{bestWpm}</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Interactive Typing Box */}
      <div
        className="relative premium-card p-4 md:p-5 rounded-2xl text-base md:text-lg font-medium leading-relaxed tracking-wide min-h-[130px] cursor-text focus-within:ring-2 focus-within:ring-primary/40 overflow-hidden"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="relative z-10 pointer-events-none select-none">
          {userInput.length === 0 && !isFinished && (
            <span className="inline-block w-[2px] h-[1.1em] bg-primary animate-pulse align-text-bottom mr-[1px]" />
          )}
          {renderText}
        </div>

        <textarea
          ref={inputRef}
          value={userInput}
          onChange={handleInput}
          disabled={isFinished}
          className="absolute inset-0 w-full h-full opacity-0 resize-none z-0"
          spellCheck={false}
          autoComplete="off"
          aria-label="Type the text shown above to test your speed"
        />

        {!isFinished && userInput.length === 0 && (
          <div className="absolute inset-x-0 bottom-2 text-center pointer-events-none">
            <p className="text-xs text-primary font-semibold animate-pulse">Start typing to test...</p>
          </div>
        )}
      </div>

      {/* Completion Alert */}
      <div aria-live="polite">
        <AnimatePresence>
          {isFinished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center"
            >
              <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                🎉 Completed! {wpm} WPM with {accuracy}% accuracy
                {wpm >= bestWpm && wpm > 0 && " — New Personal Best!"}
              </p>
              <Button
                onClick={() => pickRandomText()}
                className="mt-2 h-8 px-4 rounded-lg cta-primary text-xs border-0"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                Next Passage
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="pt-1">
          <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Recent Results</h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {history.slice(0, 5).map((h, i) => (
              <div
                key={`${h.date}-${i}`}
                className="flex justify-between items-center px-3 py-2 rounded-lg premium-card text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">{h.date}</span>
                  {h.difficulty && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${difficultyConfig[h.difficulty as Difficulty]?.bg || "bg-muted"} ${difficultyConfig[h.difficulty as Difficulty]?.color || "text-muted-foreground"}`}>
                      {h.difficulty}
                    </span>
                  )}
                </div>
                <div className="flex gap-3 font-semibold">
                  <span className="text-indigo-500">{h.wpm} WPM</span>
                  <span className="text-emerald-500">{h.accuracy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
