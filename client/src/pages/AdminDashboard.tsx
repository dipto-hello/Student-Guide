import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Users, BookOpen, Clock, Keyboard, ShieldAlert, Send, Trash2, Megaphone } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
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

interface AdminStats {
  totalUsers: number;
  totalStudySessions: number;
  totalCourses: number;
  avgTypingSpeed: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  provider: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, isAdmin, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const handleBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      toast.error("Please enter a message to broadcast");
      return;
    }

    setIsBroadcasting(true);
    try {
      const result = await api.post<{ count: number }>("/api/admin/broadcast", {
        message: broadcastMessage.trim(),
        type: "info",
      });
      toast.success(`Message broadcast to ${result.count} users`);
      setBroadcastMessage("");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to send broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.delete(`/api/admin/users/${encodeURIComponent(userId)}`);
      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to delete user");
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (!isAdmin) {
      setLocation("/");
      return;
    }

    let cancelled = false;

    const fetchAdminData = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          api.get<AdminStats>("/api/admin/stats"),
          api.get<UserData[]>("/api/admin/users"),
        ]);
        if (cancelled) return;
        setStats(statsData);
        setUsers(usersData);
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof ApiError ? error.message : "Failed to load admin data",
          );
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    fetchAdminData();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, isLoading, setLocation]);

  if (isLoading || loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/profile")} className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-destructive" />
              <h1 className="font-bold text-lg md:text-xl">Admin Control Panel</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground hidden md:inline-block">
              Logged in as {user?.name}
            </span>
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              A
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-8 relative z-10 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h2 className="text-3xl font-black mb-2">Platform Overview</h2>
          <p className="text-muted-foreground">Real-time statistics and user metrics.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Users</p>
              <h3 className="text-4xl font-black">{stats?.totalUsers || 0}</h3>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Study Sessions Logged</p>
              <h3 className="text-4xl font-black">{stats?.totalStudySessions || 0}</h3>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Total Courses Saved</p>
              <h3 className="text-4xl font-black">{stats?.totalCourses || 0}</h3>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Keyboard className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Average WPM</p>
              <h3 className="text-4xl font-black">{stats?.avgTypingSpeed || 0}</h3>
            </div>
          </Card>
        </div>

        {/* Broadcast System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10 flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-1/3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Megaphone className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Global Broadcast</h3>
                <p className="text-sm text-muted-foreground">
                  Send a push notification to all registered users simultaneously. Use this for major platform updates, server maintenance, or welcoming new users.
                </p>
              </div>
              <div className="w-full md:w-2/3 flex flex-col gap-4">
                <Textarea 
                  placeholder="Type your broadcast message here..." 
                  className="min-h-[120px] bg-background/50 border-border/50 resize-none focus-visible:ring-blue-500"
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                />
                <Button 
                  onClick={handleBroadcast} 
                  disabled={isBroadcasting}
                  className="self-end bg-blue-600 hover:bg-blue-700 text-white min-w-[200px]"
                >
                  {isBroadcasting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Send to All Users
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-border/50">
              <h3 className="text-xl font-bold">Registered Users</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Provider</th>
                    <th className="px-6 py-4 font-medium">Joined Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[150px] md:max-w-none">{u.name}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                          {u.provider}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 rounded-full" disabled={u.email === user?.email}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="premium-card border-border rounded-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-rose-500 flex items-center gap-2">
                                <Trash2 className="w-5 h-5" /> Delete User Account?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-base">
                                This will permanently delete <strong>{u.name}</strong> ({u.email}) and all their associated data (Study Sessions, CGPA, etc.). This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-transparent border-border hover:bg-accent">Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(u.id)} className="bg-rose-500 text-white hover:bg-rose-600">Yes, delete user</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
