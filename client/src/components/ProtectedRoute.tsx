import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, user, isChecking } = useAuth();
  const [, setLocation] = useLocation();

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // We redirect to home and let the home page open the auth modal, 
    // or we could render a clean "Access Denied" view
    setTimeout(() => {
      setLocation("/?login=true");
    }, 0);
    return null;
  }

  return <>{children}</>;
}
