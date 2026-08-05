import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { api, ApiError, primeCsrfToken } from "@/lib/api";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: "google" | "email";
  createdAt: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isChecking: boolean;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore the session from the auth cookie and make sure a CSRF
  // token exists before the user can trigger any mutation.
  useEffect(() => {
    let cancelled = false;

    primeCsrfToken()
      .then(() => api.get<{ user: User | null }>('/api/auth/me'))
      .then((data) => {
        if (!cancelled && data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithGoogle = useCallback(async (credential: string): Promise<boolean> => {
    try {
      const data = await api.post<{ user: User }>('/api/auth/google', { credential });
      setUser(data.user);
      toast.success(`Welcome, ${data.user.name}!`);
      return true;
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : 'Google authentication failed',
      );
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Clearing local state matters more than the server round trip here.
    }
    setUser(null);
    toast.info('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin ?? false,
        isLoading,
        isChecking: isLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
