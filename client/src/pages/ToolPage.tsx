import { lazy, Suspense } from "react";
import { Link } from "wouter";
import { ArrowLeft, Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { motion } from "framer-motion";
import NotFound from "@/pages/NotFound";

// Lazy load all tools
const CGPACalculator = lazy(() => import("@/components/tools/CGPACalculator"));
const StudyTimeManager = lazy(() => import("@/components/tools/StudyTimeManager"));
const ExamPrep = lazy(() => import("@/components/tools/ExamPrep"));
const NoteTaking = lazy(() => import("@/components/tools/NoteTaking"));
const ResourceLibrary = lazy(() => import("@/components/tools/ResourceLibrary"));
const InternshipGuide = lazy(() => import("@/components/tools/InternshipGuide"));
const ProjectIdeas = lazy(() => import("@/components/tools/ProjectIdeas"));
const TypingSpeedWidget = lazy(() => import("@/components/tools/TypingSpeedWidget"));

const toolTitles: Record<string, string> = {
  cgpa: "CGPA Calculator",
  study: "Study Time Manager",
  exam: "Exam Preparation",
  notes: "Note Taking Strategy",
  resources: "Resource Library",
  internship: "Internship Guide",
  projects: "Project Ideas Generator",
  typing: "Typing Speed Tester",
};

interface ToolPageProps {
  params: {
    id: string;
  };
}

export default function ToolPage({ params }: ToolPageProps) {
  const { id } = params;
  const { theme, toggleTheme } = useTheme();

  // Determine which component to render
  let ToolComponent;
  switch (id) {
    case "cgpa":
      ToolComponent = CGPACalculator;
      break;
    case "study":
      ToolComponent = StudyTimeManager;
      break;
    case "exam":
      ToolComponent = ExamPrep;
      break;
    case "notes":
      ToolComponent = NoteTaking;
      break;
    case "resources":
      ToolComponent = ResourceLibrary;
      break;
    case "internship":
      ToolComponent = InternshipGuide;
      break;
    case "projects":
      ToolComponent = ProjectIdeas;
      break;
    case "typing":
      ToolComponent = TypingSpeedWidget;
      break;
    default:
      return <NotFound />;
  }

  const title = toolTitles[id] || "Tool";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full opacity-10 blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-accent hover:text-accent-foreground rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl md:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="theme-toggle flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background hover:bg-accent transition-colors"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            >
              <motion.div
                initial={false}
                animate={{ rotate: theme === "dark" ? 180 : 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-indigo-600" aria-hidden="true" />
                ) : (
                  <Sun className="w-5 h-5 text-amber-400" aria-hidden="true" />
                )}
              </motion.div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 container py-8 md:py-12 relative z-10 flex flex-col items-center">
        <div className="w-full max-w-5xl premium-card rounded-3xl p-6 md:p-8 bg-card border border-border/50 shadow-xl overflow-hidden">
          <Suspense 
            fallback={
              <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                <p className="text-sm font-medium animate-pulse">Loading {title}...</p>
              </div>
            }
          >
            <ToolComponent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
