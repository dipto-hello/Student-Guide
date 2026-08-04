import { useState, useEffect, useCallback } from "react";
import { Link } from "wouter";
import { Play, Pause, RotateCcw, ArrowLeft, Volume2, VolumeX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const FOCUS_TIME = 25 * 60; // 25 minutes in seconds
const BREAK_TIME = 5 * 60;  // 5 minutes in seconds

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Audio Context (Mocked for browser compatibility without interaction, but works via Web Audio API)
  const playNotification = useCallback(() => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // A4 note
      oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 1);
    } catch (e) {
      console.log("Audio play prevented", e);
    }
  }, [audioEnabled]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      playNotification();
      setIsActive(false);
      // Auto-switch mode
      if (isFocusMode) {
        setIsFocusMode(false);
        setTimeLeft(BREAK_TIME);
      } else {
        setIsFocusMode(true);
        setTimeLeft(FOCUS_TIME);
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, isFocusMode, playNotification]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isFocusMode ? FOCUS_TIME : BREAK_TIME);
  };

  const switchMode = (focus: boolean) => {
    setIsFocusMode(focus);
    setIsActive(false);
    setTimeLeft(focus ? FOCUS_TIME : BREAK_TIME);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = isFocusMode 
    ? ((FOCUS_TIME - timeLeft) / FOCUS_TIME) * 100 
    : ((BREAK_TIME - timeLeft) / BREAK_TIME) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Dynamic Background Elements - Optimized */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full opacity-10"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full opacity-10"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full opacity-10"></div>

      {/* Navigation */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/">
          <Button variant="ghost" className="nav-surface text-foreground hover:bg-white/10" aria-label="Go back to Home">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>
      </div>
      
      <div className="absolute top-6 right-6 z-20">
        <Link href="/study-room">
          <Button variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all shadow-lg shadow-blue-500/20 rounded-full font-bold px-6">
            <Users className="w-4 h-4 mr-2" /> Join Live Study Room
          </Button>
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="premium-card-3d glow-shadow-lg w-full max-w-md p-8 rounded-[2.5rem] relative z-10 flex flex-col items-center border-0"
      >
        <div className="flex justify-between w-full items-center mb-8">
          <h1 className="text-2xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Pomodoro
          </h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={audioEnabled ? "Disable sound" : "Enable sound"}
          >
            {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 p-1 bg-white/5 dark:bg-black/20 rounded-full mb-10 w-full">
          <Button
            variant={isFocusMode ? "default" : "ghost"}
            className={`flex-1 rounded-full font-bold transition-colors ${isFocusMode ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'hover:bg-white/10'}`}
            onClick={() => switchMode(true)}
            aria-label="Focus mode"
          >
            Focus
          </Button>
          <Button
            variant={!isFocusMode ? "default" : "ghost"}
            className={`flex-1 rounded-full font-bold transition-colors ${!isFocusMode ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' : 'hover:bg-white/10'}`}
            onClick={() => switchMode(false)}
            aria-label="Break mode"
          >
            Break
          </Button>
        </div>

        {/* Timer Display */}
        <div className="relative w-64 h-64 md:w-72 md:h-72 mb-10 flex items-center justify-center glow-ring rounded-full bg-white/5 dark:bg-black/20 backdrop-blur-md border border-white/10">
          {/* Circular Progress SVG */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="4"
              fill="transparent"
              className="text-white/10 dark:text-black/10"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              className={`transition-[stroke-dashoffset] duration-1000 ease-linear ${isFocusMode ? 'text-blue-500' : 'text-green-500'}`}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-center">
            <h2 className="text-7xl font-black tracking-tighter text-foreground" aria-live="polite">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </h2>
            <p className="text-muted-foreground mt-2 font-medium">
              {isFocusMode ? "Deep Work" : "Rest & Recharge"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 items-center">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="default"
              className="w-16 h-16 rounded-full bg-white text-black hover:bg-zinc-200 shadow-xl btn-3d"
              onClick={toggleTimer}
              aria-label={isActive ? "Pause timer" : "Start timer"}
            >
              {isActive ? <Pause className="w-8 h-8 ml-0.5" /> : <Play className="w-8 h-8 ml-1" />}
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="outline"
              className="w-16 h-16 rounded-full border-white/20 hover:bg-white/10 btn-3d"
              onClick={resetTimer}
              aria-label="Reset timer"
            >
              <RotateCcw className="w-5 h-5 text-foreground" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
