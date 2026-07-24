import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { CommandMenu } from "./components/CommandMenu";
import { Notifications } from "./components/Notifications";

const Home = lazy(() => import("./pages/Home"));
const PomodoroTimer = lazy(() => import("./pages/PomodoroTimer"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const StudyRoom = lazy(() => import("./pages/StudyRoom"));
const NotFound = lazy(() => import("@/pages/NotFound"));
import ProtectedRoute from "./components/ProtectedRoute";

function Router() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <Switch>
        <Route path={"/"} component={Home} />
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
              <CommandMenu />
              <Notifications />
              <Router />
            </TooltipProvider>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
