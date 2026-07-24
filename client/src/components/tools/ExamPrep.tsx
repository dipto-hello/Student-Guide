import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  Brain,
  Coffee,
  Target,
  Sparkles,
  Award,
  BookOpen,
  Moon,
  Sun,
  ShieldCheck,
  Check
} from "lucide-react";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export default function ExamPrep() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    { id: "1", text: "Review Syllabus", completed: false },
    { id: "2", text: "Create Study Schedule", completed: false },
    { id: "3", text: "Gather Resources", completed: false },
    { id: "4", text: "Make Study Notes", completed: false },
    { id: "5", text: "Practice Problems", completed: false },
    { id: "6", text: "Take Mock Tests", completed: false },
    { id: "7", text: "Review Mistakes", completed: false },
    { id: "8", text: "Get Rest", completed: false },
  ]);

  const toggleItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = checklist.filter((item) => item.completed).length;
  const progress = Math.round((completedCount / checklist.length) * 100);

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-500 dark:text-orange-400">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Exam Preparation Guide
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your readiness and execute your test strategy
            </p>
          </div>
        </div>
      </motion.div>

      {/* Progress Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="premium-card rounded-2xl p-6 space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              Preparation Progress
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {completedCount} of {checklist.length} Tasks
            </span>
            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm">
              {progress}%
            </span>
          </div>
        </div>

        {/* Progress Bar Track */}
        <div className="w-full bg-gray-100 dark:bg-gray-800/80 rounded-full h-3.5 p-0.5 overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
          <motion.div
            className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 h-full rounded-full shadow-inner"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Completion Celebration Banner */}
      <AnimatePresence>
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="premium-card rounded-2xl p-5 border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 flex items-center gap-4 text-emerald-800 dark:text-emerald-200 shadow-lg"
          >
            <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-md">
              <Award className="w-6 h-6 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 font-bold text-base">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>All Checklist Tasks Complete!</span>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                You're fully prepped and ready for exam success. Confidence is key!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-Exam Checklist */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-orange-500" />
            Pre-Exam Checklist
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklist.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3.5 p-4 rounded-xl transition-all duration-200 border text-left ${
                item.completed
                  ? "bg-emerald-500/10 border-emerald-500/30 dark:bg-emerald-950/20"
                  : "premium-card hover:border-orange-500/40"
              }`}
            >
              <div className="relative flex items-center justify-center">
                {item.completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </motion.div>
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600 transition-colors" />
                )}
              </div>
              <span
                className={`font-medium transition-colors text-sm ${
                  item.completed
                    ? "line-through text-gray-400 dark:text-gray-500"
                    : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {item.text}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Night Before & Exam Day Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* The Night Before */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="premium-card rounded-2xl p-6 border-l-4 border-l-orange-500 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
              <Moon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              The Night Before
            </h4>
          </div>

          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <span>Review key concepts one last time</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <span>Prepare your exam materials (pen, calculator, etc.)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <span>Get a good night's sleep (7-8 hours)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <span>Have a healthy breakfast planned</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
              <span>Avoid cramming new material late at night</span>
            </li>
          </ul>
        </motion.div>

        {/* Exam Day Strategy */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="premium-card rounded-2xl p-6 border-l-4 border-l-blue-500 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Sun className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              Exam Day Strategy
            </h4>
          </div>

          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Arrive 15 minutes early</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Read all questions before starting</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Allocate time for each question</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Target className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Start with easier questions to build confidence</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Review your answers if time permits</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Manage Exam Stress */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="premium-card rounded-2xl p-6 space-y-4 border-l-4 border-l-purple-500"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Brain className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
            Manage Exam Stress
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-start gap-2.5">
            <Coffee className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <span>Practice deep breathing exercises when feeling anxious</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Coffee className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <span>Take short walks to clear your mind between sessions</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Coffee className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <span>Talk to friends or family for support</span>
          </div>
          <div className="flex items-start gap-2.5">
            <Coffee className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <span>Remember: One exam doesn't define your entire worth</span>
          </div>
          <div className="flex items-start gap-2.5 md:col-span-2">
            <Coffee className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
            <span>Focus on what you can control and trust your preparation</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
