import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";

const Home = lazy(() => import("./pages/Home"));
const PomodoroTimer = lazy(() => import("./pages/PomodoroTimer"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const StudyRoom = lazy(() => import("./pages/StudyRoom"));
const ToolPage = lazy(() => import("./pages/ToolPage"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Global overlays that are always mounted but never needed for first paint.
// Deferring them keeps their heavy deps (cmdk, framer-motion) out of the entry
// chunk so the initial shell renders sooner; they hydrate a tick later, which
// is imperceptible for a Cmd+K palette and a notifications bell.
const CommandMenu = lazy(() =>
  import("./components/CommandMenu").then((m) => ({ default: m.CommandMenu })),
);
const Notifications = lazy(() =>
  import("./components/Notifications").then((m) => ({ default: m.Notifications })),
);
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/tool/:id"} component={ToolPage} />
        <Route path={"/pomodoro"} component={PomodoroTimer} />
        <Route path={"/study-room"}>
          <ProtectedRoute>
            <StudyRoom />
          </ProtectedRoute>
        </Route>
        <Route path={"/analytics"} component={AnalyticsDashboard} />
        <Route path={"/profile"}>
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path={"/admin"}>
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        </Route>
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <AuthProvider>
          <SocketProvider>
            <TooltipProvider>
              <Toaster />
              <Suspense fallback={null}>
                <CommandMenu />
                <Notifications />
              </Suspense>
              <Router />
            </TooltipProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
