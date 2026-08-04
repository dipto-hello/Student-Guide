import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalyticsDashboard() {
  const { isAuthenticated, isChecking } = useAuth();
  
  const [wpmData, setWpmData] = useState<{ day: string, wpm: number }[]>([]);
  const [cgpaData, setCgpaData] = useState<{ semester: string, gpa: number }[]>([]);
  const [stats, setStats] = useState({
    avgWpmGrowth: 0,
    currentCgpa: 0,
    studyStreak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isChecking) return;
    
    if (!isAuthenticated) {
      // Mock data for guests
      setWpmData([
        { day: 'Mon', wpm: 45 }, { day: 'Tue', wpm: 52 }, { day: 'Wed', wpm: 48 },
        { day: 'Thu', wpm: 61 }, { day: 'Fri', wpm: 59 }, { day: 'Sat', wpm: 68 }, { day: 'Sun', wpm: 75 },
      ]);
      setCgpaData([
        { semester: 'Sem 1', gpa: 3.2 }, { semester: 'Sem 2', gpa: 3.4 }, { semester: 'Sem 3', gpa: 3.3 },
        { semester: 'Sem 4', gpa: 3.6 }, { semester: 'Sem 5', gpa: 3.8 },
      ]);
      setStats({ avgWpmGrowth: 66, currentCgpa: 3.80, studyStreak: 14 });
      setLoading(false);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        const [scoresRes, coursesRes, streaksRes] = await Promise.all([
          fetch('/api/user/typing-history', { credentials: 'include' }),
          fetch('/api/user/courses', { credentials: 'include' }),
          fetch('/api/user/streak', { credentials: 'include' })
        ]);

        const scores = await scoresRes.json();
        const courses = await coursesRes.json();
        const streakData = await streaksRes.json();

        // Process WPM Data (last 7 tests)
        let processedWpm: { day: string, wpm: number }[] = [];
        if (Array.isArray(scores) && scores.length > 0) {
          const recentScores = [...scores].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(-10);
          processedWpm = recentScores.map((s, idx) => ({
            day: `Test ${idx + 1}`,
            wpm: s.wpm
          }));
          
          const first = processedWpm[0].wpm;
          const last = processedWpm[processedWpm.length - 1].wpm;
          let growth = 0;
          if (first > 0) growth = Math.round(((last - first) / first) * 100);
          setStats(s => ({ ...s, avgWpmGrowth: growth }));
        } else {
          processedWpm = [{ day: 'No Data', wpm: 0 }];
        }
        setWpmData(processedWpm);

        // Process CGPA Data
        if (Array.isArray(courses) && courses.length > 0) {
          let totalPoints = 0;
          let totalCredits = 0;
          const courseProgression = courses.map((c, idx) => {
            totalPoints += (c.grade * c.creditHours);
            totalCredits += c.creditHours;
            return {
              semester: `C${idx + 1}`,
              gpa: Number((totalPoints / totalCredits).toFixed(2))
            };
          });
          setCgpaData(courseProgression);
          setStats(s => ({ ...s, currentCgpa: Number((totalPoints / totalCredits).toFixed(2)) }));
        } else {
          setCgpaData([{ semester: 'No Data', gpa: 0 }]);
        }

        if (streakData && streakData.currentStreak !== undefined) {
          setStats(s => ({ ...s, studyStreak: streakData.currentStreak }));
        }

      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAuthenticated, isChecking]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col p-4 md:p-8">
      {/* Dynamic Background Elements - Optimized */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full opacity-10"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full opacity-10"></div>

      {/* Navigation */}
      <div className="relative z-20 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="ultra-glass-nav text-foreground hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hidden sm:block">
            Student Analytics
          </h1>
        </div>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
        
        {/* KPI Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="premium-card-3d glow-shadow-sm hover:glow-shadow-md transition-shadow duration-300 p-6 rounded-2xl flex items-center gap-4 border-0">
            <div className="p-4 bg-blue-500/10 rounded-xl">
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Avg. WPM Growth</p>
              {loading ? <Skeleton className="h-8 w-20 mt-1" /> : <p className="text-3xl font-black text-foreground">{stats.avgWpmGrowth > 0 ? '+' : ''}{stats.avgWpmGrowth}%</p>}
            </div>
          </Card>
          <Card className="premium-card-3d glow-shadow-sm hover:glow-shadow-md transition-shadow duration-300 p-6 rounded-2xl flex items-center gap-4 border-0">
            <div className="p-4 bg-purple-500/10 rounded-xl">
              <Target className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Current CGPA</p>
              {loading ? <Skeleton className="h-8 w-20 mt-1" /> : <p className="text-3xl font-black text-foreground">{stats.currentCgpa.toFixed(2)}</p>}
            </div>
          </Card>
          <Card className="premium-card-3d glow-shadow-sm hover:glow-shadow-md transition-shadow duration-300 p-6 rounded-2xl flex items-center gap-4 border-0">
            <div className="p-4 bg-orange-500/10 rounded-xl">
              <Zap className="w-8 h-8 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Study Streak</p>
              {loading ? <Skeleton className="h-8 w-20 mt-1" /> : <p className="text-3xl font-black text-foreground">{stats.studyStreak} Days</p>}
            </div>
          </Card>
        </motion.div>

        {/* Typing Speed Area Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="md:col-span-2">
          <Card className="ultra-glass p-6 rounded-3xl h-[400px] flex flex-col border-white/10 relative">
            <h3 className="text-xl font-bold mb-6 text-foreground">Typing Speed Progression</h3>
            {loading ? (
              <div className="flex-1 flex items-end gap-2 w-full">
                {[1,2,3,4,5,6,7].map(i => <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${Math.max(20, Math.random() * 80)}%` }} />)}
              </div>
            ) : (
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={wpmData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWpm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      itemStyle={{ color: '#3B82F6', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="wpm" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorWpm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
            {!isAuthenticated && !loading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center p-6 text-center z-10">
                <div className="premium-card p-6 rounded-2xl border border-border shadow-xl">
                  <p className="font-bold text-lg mb-2">Demo Data</p>
                  <p className="text-sm text-muted-foreground">Sign in to track your actual typing speed progress.</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* CGPA Bar Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="md:col-span-1">
          <Card className="ultra-glass p-6 rounded-3xl h-[400px] flex flex-col border-white/10 relative">
            <h3 className="text-xl font-bold mb-6 text-foreground">CGPA Overview</h3>
            {loading ? (
              <div className="flex-1 flex items-end gap-2 w-full">
                {[1,2,3,4].map(i => <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${Math.max(40, Math.random() * 100)}%` }} />)}
              </div>
            ) : (
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cgpaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="semester" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} domain={[0, 4]} />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                      itemStyle={{ color: '#8B5CF6', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="gpa" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
            {!isAuthenticated && !loading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-3xl flex items-center justify-center p-6 text-center z-10">
                <div className="premium-card p-6 rounded-2xl border border-border shadow-xl">
                  <p className="font-bold text-lg mb-2">Demo Data</p>
                  <p className="text-sm text-muted-foreground">Sign in to track your actual CGPA.</p>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
