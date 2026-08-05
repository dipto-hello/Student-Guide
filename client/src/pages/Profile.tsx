import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { User, Mail, Shield, LogOut, Trash2, Edit3, Save, X, AlertTriangle, ShieldAlert } from "lucide-react";
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

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);
  
  if (!user) return null; // Handled by ProtectedRoute

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/");
      toast.success("Logged out successfully");
    } catch (e) {
      toast.error("Failed to logout");
    }
  };

  const handleSaveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed || trimmed === user.name) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await api.put("/api/user/profile", { name: trimmed });
      toast.success("Profile updated! Please refresh to see changes globally.");
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete("/api/user/account");
      toast.success("Account deleted successfully.");
      await logout();
      setLocation("/");
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Failed to delete account");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl pt-24 pb-12 px-4 animate-fade-in">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
          <User className="w-10 h-10 text-primary" />
          Your Profile
        </h1>
        <p className="text-muted-foreground text-lg">Manage your account settings and preferences.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="premium-card rounded-2xl p-6 shadow-xl border border-border">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-border pb-4">
              <Shield className="w-5 h-5 text-indigo-500" /> Account Details
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Display Name</p>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={nameInput} 
                        onChange={(e) => setNameInput(e.target.value)}
                        className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <Button onClick={handleSaveName} disabled={isSaving} size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white">
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-bold">{user.name}</p>
                      <button onClick={() => setIsEditing(true)} className="text-muted-foreground hover:text-primary transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                <div className="flex items-center gap-2 p-3 bg-accent/30 rounded-lg border border-border/50">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{user.email}</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Authentication Method</p>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${user.provider === 'google' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {user.provider}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isAdmin && (
            <div className="premium-card rounded-2xl p-6 shadow-xl border border-border border-l-4 border-l-amber-500 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent pointer-events-none" />
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-amber-500 relative z-10">
                <ShieldAlert className="w-5 h-5" /> Admin Controls
              </h2>
              <p className="text-sm text-muted-foreground mb-6 relative z-10">You have administrative privileges on this platform.</p>
              
              <Button 
                onClick={() => setLocation("/admin")} 
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 relative z-10 shadow-lg shadow-amber-500/20"
              >
                <ShieldAlert className="w-4 h-4" /> Open Admin Dashboard
              </Button>
            </div>
          )}

          <div className="premium-card rounded-2xl p-6 shadow-xl border border-border border-l-4 border-l-rose-500">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Actions here cannot be undone. Please be careful.</p>
            
            <div className="space-y-3">
              <Button onClick={handleLogout} variant="outline" className="w-full flex items-center justify-center gap-2 border-border hover:bg-accent">
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20">
                    <Trash2 className="w-4 h-4" /> Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="premium-card border-border rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-rose-500 flex items-center gap-2">
                      <Trash2 className="w-5 h-5" /> Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                      This action cannot be undone. This will permanently delete your account
                      and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent border-border hover:bg-accent">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-rose-500 text-white hover:bg-rose-600">Yes, delete account</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
