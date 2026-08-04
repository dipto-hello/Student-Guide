import React, { useEffect, useState } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Clock, Play, Pause, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export default function StudyRoom() {
  const { socket, isConnected } = useSocket();
  const { user, isAuthenticated } = useAuth();
  const [activeUsers, setActiveUsers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [peers, setPeers] = useState<Record<string, { timeLeft: number, status: string }>>({});

  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.emit('join_study_room');

    socket.on('room_stats', (stats: { activeUsers: number }) => {
      setActiveUsers(stats.activeUsers);
    });

    socket.on('timer_update', (data: { userId: string, timeLeft: number, status: string }) => {
      setPeers(prev => ({
        ...prev,
        [data.userId]: { timeLeft: data.timeLeft, status: data.status }
      }));
    });

    socket.on('user_left', (data: { userId: string }) => {
      setPeers(prev => {
        const newPeers = { ...prev };
        delete newPeers[data.userId];
        return newPeers;
      });
    });

    return () => {
      socket.emit('leave_study_room');
      socket.off('room_stats');
      socket.off('timer_update');
      socket.off('user_left');
    };
  }, [socket, isConnected]);

  // Local Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Sync timer to room every 5 seconds
  useEffect(() => {
    if (!socket || !isConnected) return;
    const interval = setInterval(() => {
      socket.emit('sync_timer', { 
        timeLeft, 
        status: isActive ? 'studying' : 'paused' 
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [socket, isConnected, timeLeft, isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <h2 className="text-2xl font-bold mb-4">Study Room</h2>
          <p className="text-muted-foreground mb-6">Please log in to join the collaborative study room.</p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 mb-8 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="ultra-glass-nav text-foreground hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>
        <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-xl font-bold">
          <Users className="w-5 h-5" />
          {activeUsers} Online
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Main Personal Timer */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="md:col-span-2">
          <Card className="premium-card p-12 text-center rounded-3xl border-0 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
            <div className={`absolute inset-0 opacity-20 transition-colors duration-1000 ${isActive ? 'bg-emerald-500' : 'bg-transparent'}`} />
            
            <h2 className="text-2xl font-bold mb-8 relative z-10 text-foreground/80">
              Your Focus Session
            </h2>
            
            <div className="text-6xl sm:text-8xl md:text-9xl font-black mb-12 tracking-tighter tabular-nums relative z-10 text-foreground">
              {formatTime(timeLeft)}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <Button 
                onClick={toggleTimer} 
                size="lg"
                className={`h-16 px-8 sm:px-12 rounded-2xl text-xl font-bold transition-all hover:scale-105 ${isActive ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
              >
                {isActive ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                {isActive ? 'Pause' : 'Start'}
              </Button>
              <Button 
                variant="outline"
                size="lg"
                onClick={() => setTimeLeft(25 * 60)}
                className="h-16 px-6 sm:px-8 rounded-2xl border-border hover:bg-accent"
              >
                Reset
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Peers Sidebar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="font-bold text-xl flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-indigo-500" />
            Others Studying
          </h3>
          
          <div className="space-y-3">
            {Object.keys(peers).length === 0 ? (
              <div className="premium-card p-6 text-center rounded-2xl border-dashed border-2 border-border/50 text-muted-foreground text-sm">
                You're the only one here right now. Keep focusing!
              </div>
            ) : (
              Object.entries(peers).map(([id, data]) => (
                <Card key={id} className="premium-card p-4 rounded-xl border-0 flex items-center justify-between hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-bold shadow-inner">
                      {id.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Student</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="relative flex h-2 w-2">
                          {data.status === 'studying' ? (
                            <>
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </>
                          ) : (
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          )}
                        </span>
                        <span className="text-xs text-muted-foreground capitalize">{data.status}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-bold tabular-nums text-foreground/80">
                    {formatTime(data.timeLeft)}
                  </div>
                </Card>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
