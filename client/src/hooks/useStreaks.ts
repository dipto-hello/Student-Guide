import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  achievements: string[];
}

export function useStreaks() {
  const { isAuthenticated } = useAuth();
  
  const [streakData, setStreakData] = useState<StreakData>(() => {
    try {
      const stored = localStorage.getItem("student_streaks");
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: "",
      achievements: [],
    };
  });

  // Sync to local storage for guests, or fallback
  useEffect(() => {
    localStorage.setItem("student_streaks", JSON.stringify(streakData));
  }, [streakData]);

  // Fetch from server if logged in
  useEffect(() => {
    if (isAuthenticated) {
      fetch('/api/user/streak', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (data && data.currentStreak !== undefined) {
            setStreakData(data);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const recordActivity = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    if (streakData.lastActiveDate === today) return;

    setStreakData((prev) => {
      let newCurrent = prev.currentStreak;
      if (prev.lastActiveDate) {
        const lastDate = new Date(prev.lastActiveDate);
        const todayDate = new Date(today);
        const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) newCurrent += 1;
        else if (diffDays > 1) newCurrent = 1;
      } else {
        newCurrent = 1;
      }
      return {
        ...prev,
        currentStreak: newCurrent,
        longestStreak: Math.max(prev.longestStreak, newCurrent),
        lastActiveDate: today,
      };
    });

    if (isAuthenticated) {
      fetch('/api/user/streak/activity', { method: 'POST', credentials: 'include' }).catch(() => {});
    }
  }, [streakData.lastActiveDate, isAuthenticated]);

  const unlockAchievement = useCallback((id: string) => {
    setStreakData((prev) => {
      if (prev.achievements.includes(id)) return prev;
      return { ...prev, achievements: [...prev.achievements, id] };
    });

    if (isAuthenticated) {
      fetch('/api/user/streak/achievement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ achievementId: id }),
        credentials: 'include'
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  return { streakData, recordActivity, unlockAchievement };
}
