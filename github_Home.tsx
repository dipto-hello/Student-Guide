import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Clock,
  Zap,
  Lightbulb,
  FileText,
  Link as LinkIcon,
  Briefcase,
  Sun,
  Moon,
  Menu,
  X,
  Github,
  Star,
  Quote,
  Trophy,
  Users,
  Timer,
  Sparkles,
  GraduationCap,
  ChevronRight,
  LogIn,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useTransition, lazy, Suspense, memo } from "react";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { AuthModal } from "@/components/AuthModal";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import Tilt3DCard from "@/components/Tilt3DCard";
import FloatingParticles from "@/components/FloatingParticles";
import ScrollReveal from "@/components/ScrollReveal";

/* ──────────────────────────────────────────────────
   LAZY-LOADED TOOL COMPONENTS
   ────────────────────────────────────────────────── */
const CGPACalculator = lazy(() => import("@/components/tools/CGPACalculator"));
const StudyTimeManager = lazy(() => import("@/components/tools/StudyTimeManager"));
const ExamPrep = lazy(() => import("@/components/tools/ExamPrep"));
const NoteTaking = lazy(() => import("@/components/tools/NoteTaking"));
const ResourceLibrary = lazy(() => import("@/components/tools/ResourceLibrary"));
const InternshipGuide = lazy(() => import("@/components/tools/InternshipGuide"));
const ProjectIdeas = lazy(() => import("@/components/tools/ProjectIdeas"));
const TypingSpeedWidget = lazy(() => import("@/components/tools/TypingSpeedWidget"));

/* ──────────────────────────────────────────────────
   CONSTANTS
   ────────────────────────────────────────────────── */
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

const NAV_ITEMS = ["about", "tools", "features", "testimonials"] as const;
const NAV_LABELS: Record<string, string> = { testimonials: "Reviews", about: "About" };

/* ──────────────────────────────────────────────────
   FRAMER MOTION VARIANTS
   ────────────────────────────────────────────────── */
const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 },
  },
};

/* ──────────────────────────────────────────────────
   TOOL GRID DATA
   ────────────────────────────────────────────────── */
const tools = [
  {
    id: "cgpa",
    icon: Calculator,
    title: "CGPA Calculator",
    desc: "Calculate semester & cumulative GPA with precision.",
    iconBg: "bg-indigo-500/10 text-indigo-500",
  },
  {
    id: "pomodoro",
    icon: Timer,
    title: "Pomodoro Timer",
    desc: "Dedicated full-page timer for deep work sessions.",
    iconBg: "bg-teal-500/10 text-teal-500",
    isRoute: true,
  },
  {
    id: "typing",
    icon: Zap,
    title: "Typing Speed Test",
    desc: "Check WPM and accuracy with live audio feedback.",
    iconBg: "bg-violet-500/10 text-violet-500",
  },
  {
    id: "study-room",
    icon: Users,
    title: "Live Study Room",
    desc: "Join a real-time collaborative study session with peers.",
    iconBg: "bg-blue-500/10 text-blue-500",
    isRoute: true,
  },
  {
    id: "study",
    icon: Clock,
    title: "Study Manager",
    desc: "Plan study sessions with Pomodoro cycles.",
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "exam",
    icon: BookOpen,
    title: "Exam Prep",
    desc: "Expert tips, checklists, and strategies.",
    iconBg: "bg-orange-500/10 text-orange-500",
  },
  {
    id: "notes",
    icon: FileText,
    title: "Note Strategy",
    desc: "Master effective digital note methods.",
    iconBg: "bg-pink-500/10 text-pink-500",
  },
  {
    id: "resources",
    icon: LinkIcon,
    title: "Resource Library",
    desc: "Curated learning platforms & tech portals.",
    iconBg: "bg-cyan-500/10 text-cyan-500",
  },
  {
    id: "internship",
    icon: Briefcase,
    title: "Internship Guide",
    desc: "Roadmap & checklist to finding tech internships.",
    iconBg: "bg-amber-500/10 text-amber-500",
  },
] as const;

/* ──────────────────────────────────────────────────
   TESTIMONIAL DATA
   ────────────────────────────────────────────────── */
const testimonials = [
  {
    name: "Abir Mahmud",
    role: "CSE, 3rd Year",
    quote:
      "The CGPA calculator and study planner completely changed how I organize my semesters. My grades have improved significantly!",
    gradient: "from-indigo-500 to-cyan-500",
  },
  {
    name: "Sadia Rahman",
    role: "SWE, 4th Year",
    quote:
      "The internship guide gave me exactly what I needed to build my CV and ace interviews. I just landed my first tech job!",
    gradient: "from-violet-500 to-pink-500",
  },
  {
    name: "Tanvir Hasan",
    role: "CSE, 2nd Year",
    quote:
      "I found amazing project ideas that I actually built. They helped me create a solid portfolio. This hub is a lifesaver.",
    gradient: "from-orange-500 to-rose-500",
  },
] as const;

/* ──────────────────────────────────────────────────
   STAT DATA
   ────────────────────────────────────────────────── */
const stats = [
  { icon: Users, value: "500+", label: "Students Helped", color: "text-indigo-500" },
  { icon: Calculator, value: "8+", label: "Premium Tools", color: "text-violet-500" },
  { icon: Trophy, value: "99%", label: "Success Rate", color: "text-orange-500" },
  { icon: Star, value: "4.9", label: "Average Rating", color: "text-amber-500" },
] as const;

/* ──────────────────────────────────────────────────
   MEMOIZED SUB-COMPONENTS
   ────────────────────────────────────────────────── */
const HeroMesh = memo(function HeroMesh() {
  return (
    <>
      <div
        className="mesh-orb mesh-orb-1 z-0 opacity-40"
        style={{
          top: "10%",
          left: "10%",
          width: "450px",
          height: "450px",
          background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
        }}
      />
      <div
        className="mesh-orb mesh-orb-2 z-0 opacity-40"
        style={{
          top: "20%",
          right: "5%",
          width: "550px",
          height: "550px",
          background: "radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 65%)",
        }}
      />
    </>
  );
});

const StatCard = memo(function StatCard({
  icon: Icon,
  value,
  label,
  color,
}: (typeof stats)[number]) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="premium-card-3d glow-shadow-sm p-5 text-center h-full border-0 rounded-2xl hover:glow-shadow-md transition-shadow duration-300">
        <div className="flex justify-center mb-2.5">
          <Icon className={`w-8 h-8 ${color}`} aria-hidden="true" />
        </div>
        <h3 className="stat-value text-2xl md:text-3xl font-black mb-1">{value}</h3>
        <p className="text-muted-foreground font-semibold text-xs md:text-sm">{label}</p>
      </Card>
    </motion.div>
  );
});

const ToolCard = memo(function ToolCard({
  tool,
  onOpen,
}: {
  tool: (typeof tools)[number];
  onOpen: (id: string) => void;
}) {
  const Icon = tool.icon;
  return (
    <motion.div variants={fadeUp} className="relative z-10">
      <Tilt3DCard
        className="h-full"
        glowColor={tool.iconBg.includes('indigo') ? 'rgba(99,102,241,0.15)' :
                   tool.iconBg.includes('violet') ? 'rgba(139,92,246,0.15)' :
                   tool.iconBg.includes('teal') ? 'rgba(20,184,166,0.15)' :
                   tool.iconBg.includes('blue') ? 'rgba(59,130,246,0.15)' :
                   tool.iconBg.includes('emerald') ? 'rgba(16,185,129,0.15)' :
                   tool.iconBg.includes('orange') ? 'rgba(249,115,22,0.15)' :
                   tool.iconBg.includes('pink') ? 'rgba(236,72,153,0.15)' :
                   tool.iconBg.includes('cyan') ? 'rgba(6,182,212,0.15)' :
                   tool.iconBg.includes('amber') ? 'rgba(245,158,11,0.15)' :
                   'rgba(99,102,241,0.15)'}
      >
        <Card
          className="premium-card-3d p-6 h-full cursor-pointer border-0 rounded-2xl group/card flex flex-col justify-between"
          onClick={() => onOpen(tool.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen(tool.id);
            }
          }}
          aria-label={`Open ${tool.title}`}
        >
          <div>
            <div className={`tool-icon-wrap mb-4 ${tool.iconBg}`}>
              <Icon className="w-6 h-6" aria-hidden="true" />
            </div>
            <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground truncate">{tool.title}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{tool.desc}</p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary opacity-80 group-hover/card:opacity-100 transition-opacity">
            <span>Open Tool</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
        </Card>
      </Tilt3DCard>
    </motion.div>
  );
});

const TestimonialCard = memo(function TestimonialCard({
  t,
}: {
  t: (typeof testimonials)[number];
}) {
  return (
    <motion.div variants={fadeUp}>
      <Card className="premium-card p-7 h-full border-0 rounded-2xl relative overflow-hidden">
        <Quote className="quote-decoration w-16 h-16 text-foreground" aria-hidden="true" />
        <div className="flex gap-1 mb-4 text-amber-400 relative z-10">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} className="w-4 h-4 fill-current" aria-hidden="true" />
          ))}
        </div>
        <p className="text-foreground/90 font-medium text-sm md:text-base italic mb-6 relative z-10 leading-relaxed">
          &ldquo;{t.quote}&rdquo;
        </p>
        <div className="flex items-center gap-3 relative z-10">
          <div
            className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-xs shadow-md`}
          >
            {t.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div>
            <h4 className="font-bold text-sm">{t.name}</h4>
            <p className="text-xs text-primary font-medium">{t.role}</p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
});

/* ══════════════════════════════════════════════════
   MAIN HOME COMPONENT
   ══════════════════════════════════════════════════ */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [showTool, setShowTool] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const spotlightRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (window.location.search.includes("login=true")) {
      setIsAuthOpen(true);
      // Clean up URL without triggering navigation
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const handleShowTool = useCallback(
    (id: string | null) => {
      startTransition(() => {
        setShowTool(id);
      });
    },
    [startTransition],
  );

  const handleToolOpen = useCallback(
    (id: string) => {
      const t = tools.find((x) => x.id === id);
      if (t && "isRoute" in t && t.isRoute) {
        setLocation(`/${id}`);
      } else {
        handleShowTool(id);
      }
    },
    [handleShowTool, setLocation],
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlightRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(99,102,241,0.08), transparent 40%)`;
  }, []);

  const handleNavClick = useCallback(
    (id: string) => {
      setIsMobileMenuOpen(false);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    },
    [],
  );

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen} />

      {/* ════════════════════════════════════════════
          NAVIGATION
          ════════════════════════════════════════════ */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed w-full top-0 z-50 transition-colors duration-300 ${
          scrolled || isMobileMenuOpen ? "nav-surface" : "bg-transparent"
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container flex items-center justify-between h-16 gap-4">
          <button
            className="flex items-center gap-2.5 group shrink-0"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
          >
            <span className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white text-lg font-bold shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow duration-300">
              S
            </span>
            <span className="font-bold text-lg text-foreground whitespace-nowrap">Student Hub</span>
          </button>

          <div className="hidden md:flex items-center gap-5 lg:gap-8 shrink" role="menubar">
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className="text-foreground/70 hover:text-primary transition-colors text-sm font-semibold capitalize whitespace-nowrap"
                aria-label={`Navigate to ${item}`}
                role="menuitem"
              >
                {NAV_LABELS[item] || item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              className="theme-toggle shrink-0"
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

            {/* Authentication Button or User Menu */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setLocation('/profile')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-accent/50 border border-border/50 hover:bg-accent transition-colors cursor-pointer"
                  title="Go to Profile"
                >
                  <img
                    src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-6 h-6 rounded-full border border-primary/30"
                  />
                  <span className="text-xs font-bold text-foreground hidden sm:inline max-w-[90px] truncate">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="h-9 w-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setIsAuthOpen(true)}
                variant="outline"
                className="h-9 px-3.5 sm:px-4 rounded-xl text-xs font-semibold border-border hover:bg-accent flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sign In</span>
              </Button>
            )}

            <button
              className="md:hidden p-2 text-foreground/70 hover:text-primary transition-colors shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>

            <Button
              className="hidden lg:flex cta-primary h-9 px-4 lg:px-5 rounded-xl text-xs lg:text-sm border-0 whitespace-nowrap shrink-0"
              onClick={() => handleNavClick("tools")}
            >
              Explore Tools
              <Sparkles className="ml-1.5 w-4 h-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute top-16 left-0 right-0 nav-surface border-t border-border p-4 shadow-xl"
              role="menu"
            >
              <div className="flex flex-col gap-3 text-center">
                {NAV_ITEMS.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleNavClick(item)}
                    className="block py-2.5 text-foreground hover:text-primary font-medium capitalize w-full"
                    aria-label={`Navigate to ${item}`}
                    role="menuitem"
                  >
                    {NAV_LABELS[item] || item}
                  </button>
                ))}
                <Button
                  className="w-full cta-primary h-10 rounded-xl border-0 mt-1"
                  onClick={() => handleNavClick("tools")}
                >
                  Explore Tools
                  <Sparkles className="ml-1.5 w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ════════════════════════════════════════════
          HERO SECTION
          ════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-16 md:pb-24 overflow-hidden flex items-center">
        <div className="absolute inset-0 bg-background/60 z-0" />
        <FloatingParticles count={25} color="rgba(99,102,241,0.35)" />
        <HeroMesh />

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full hero-badge mb-8"
            >
              <GraduationCap className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="text-sm font-bold text-foreground">Your Complete Academic Toolkit</span>
            </motion.div>

            <h1 className="gradient-text-shimmer hero-title font-extrabold mb-6 text-5xl md:text-7xl tracking-tight leading-[1.1]">
              Master Your
              <br />
              Academic Journey
            </h1>

            <p className="hero-subtitle text-lg md:text-xl text-foreground/70 mb-10 leading-relaxed font-medium max-w-2xl mx-auto">
              Elevate your grades with powerful tools for CGPA tracking, study planning, exam prep, and career
              guidance — all in one premium workspace.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl cta-primary text-base border-0"
                  onClick={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Start Exploring
                  <ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto h-13 px-8 rounded-2xl cta-outline text-base"
                  onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                >
                  About Creator
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STATS SECTION (Clean positioning)
          ════════════════════════════════════════════ */}
      <section className="py-6 relative z-20" aria-label="Statistics">
        <div className="container">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
          >
            {stats.map((stat, i) => (
              <StatCard key={i} {...stat} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          ABOUT CREATOR (Placed right near top!)
          ════════════════════════════════════════════ */}
      <section id="about" className="py-16 md:py-20 relative" aria-labelledby="about-heading">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="premium-card p-8 md:p-12 border-0 rounded-[2rem] overflow-hidden">
              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div
                      className="absolute -inset-2 rounded-3xl opacity-30"
                      style={{
                        background: "linear-gradient(135deg, #6366F1, #A855F7, #EC4899)",
                      }}
                    />
                    <img
                      src="/creator-profile.jpg"
                      alt="Dipto Sarker, creator of Student Success Hub"
                      className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl object-cover border-2 border-white/10 shadow-xl"
                      loading="lazy"
                      width={192}
                      height={192}
                    />
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2
                    id="about-heading"
                    className="text-xs font-bold uppercase tracking-widest text-primary mb-1.5"
                  >
                    About The Creator
                  </h2>
                  <h3 className="text-3xl md:text-4xl font-black mb-2 text-foreground">Dipto Sarker</h3>
                  <p className="text-sm md:text-base text-foreground/80 font-semibold mb-4 flex items-center justify-center md:justify-start gap-2">
                    <GraduationCap className="w-5 h-5 text-violet-500" aria-hidden="true" />
                    Daffodil International University
                  </p>

                  <p className="text-foreground/70 text-sm md:text-base mb-6 leading-relaxed font-medium">
                    I engineered this comprehensive resource hub to help university students navigate their academic journey
                    seamlessly. This platform fuses practical tools, proven strategies, and an ultra-modern
                    aesthetic to help you excel.
                  </p>

                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <a
                      href="https://www.linkedin.com/in/diptohello/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0A66C2] text-white rounded-xl font-bold text-xs shadow-lg hover:opacity-90 transition-opacity"
                    >
                      LinkedIn
                    </a>

                    <a
                      href="https://github.com/dipto-hello"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-xl font-bold text-xs shadow-lg hover:opacity-90 transition-opacity"
                    >
                      <Github className="w-4 h-4" aria-hidden="true" />
                      GitHub
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Section divider */}
      <div className="section-glow-divider mx-auto max-w-xl" />

      {/* ════════════════════════════════════════════
          TOOLS SECTION (Clean 3-column responsive grid)
          ════════════════════════════════════════════ */}
      <section id="tools" className="py-20 md:py-24 relative" aria-labelledby="tools-heading">
        <div className="container">
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 id="tools-heading" className="mb-3 text-4xl md:text-5xl font-black">
              Essential Tools
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-medium max-w-2xl mx-auto">
              Powerful calculators, timers, and planners engineered for academic excellence.
            </p>
          </motion.header>

          <motion.div
            onMouseMove={handleMouseMove}
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="spotlight-container relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2 md:p-4 rounded-3xl"
          >
            <div ref={spotlightRef} className="spotlight-glow" />

            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onOpen={handleToolOpen} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Section divider */}
      <div className="section-glow-divider mx-auto max-w-xl" />

      {/* ════════════════════════════════════════════
          PROJECT IDEAS (FEATURED)
          ════════════════════════════════════════════ */}
      <section id="features" className="py-20 md:py-24 relative" aria-labelledby="features-heading">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <Card
              className="glow-border-card animated-gradient-border glow-shadow-lg p-8 md:p-12 cursor-pointer border-0 rounded-3xl hover:glow-shadow-lg transition-shadow duration-500"
              onClick={() => handleShowTool("projects")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleShowTool("projects");
                }
              }}
              aria-label="Open Project Ideas Generator"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="flex-shrink-0 inline-flex p-5 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                  <Lightbulb className="w-10 h-10 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 id="features-heading" className="text-3xl font-black mb-3">
                    Project Ideas Generator
                  </h3>
                  <p className="text-foreground/70 text-base md:text-lg mb-6 leading-relaxed">
                    Get inspired with project ideas across Web Dev, Mobile, Data Science, AI, and Game Dev. The
                    perfect catalyst for your next big portfolio piece.
                  </p>
                  <Button className="h-11 px-8 rounded-xl cta-primary text-sm border-0">
                    Explore Ideas
                    <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TESTIMONIALS
          ════════════════════════════════════════════ */}
      <section id="testimonials" className="py-20 md:py-24 relative z-10" aria-labelledby="testimonials-heading">
        <div className="container">
          <motion.header
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 id="testimonials-heading" className="mb-3 text-4xl md:text-5xl font-black">
              Success Stories
            </h2>
            <p className="text-base md:text-lg text-muted-foreground font-medium">
              Join thousands of students elevating their academic game.
            </p>
          </motion.header>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid md:grid-cols-3 gap-6"
          >
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          TOOL DIALOG MODAL
          ════════════════════════════════════════════ */}
      <Dialog open={!!showTool} onOpenChange={(open) => !open && handleShowTool(null)}>
        <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto bg-background/95 border border-border shadow-2xl rounded-3xl p-0">
          <div className="p-5 md:p-8">
            <DialogTitle className="text-xl md:text-2xl font-black mb-3 flex items-center gap-2">
              {showTool ? toolTitles[showTool] || "Tool" : "Tool"}
              {isPending && (
                <span className="text-xs text-muted-foreground animate-pulse ml-3 font-normal">
                  Loading...
                </span>
              )}
            </DialogTitle>
            <div className="mt-2 relative min-h-[350px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={showTool || "empty"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="w-full">
                    <Suspense
                      fallback={
                        <div className="p-8 text-center text-muted-foreground text-sm">Loading tool...</div>
                      }
                    >
                      {showTool === "cgpa" && <CGPACalculator />}
                      {showTool === "study" && <StudyTimeManager />}
                      {showTool === "exam" && <ExamPrep />}
                      {showTool === "notes" && <NoteTaking />}
                      {showTool === "resources" && <ResourceLibrary />}
                      {showTool === "internship" && <InternshipGuide />}
                      {showTool === "projects" && <ProjectIdeas />}
                      {showTool === "typing" && <TypingSpeedWidget />}
                    </Suspense>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════════
          FOOTER
          ════════════════════════════════════════════ */}
      <footer className="footer-surface pt-14 pb-8 relative z-10 mt-16" role="contentinfo">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-10">
            <div>
              <h4 className="font-bold text-base mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
                Tools
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li>
                  <button
                    onClick={() => handleShowTool("cgpa")}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    CGPA Calculator
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleShowTool("study")}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    Study Manager
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleShowTool("exam")}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    Exam Prep
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-violet-500" aria-hidden="true" />
                Resources
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li>
                  <button
                    onClick={() => handleShowTool("resources")}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    Resource Library
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleShowTool("internship")}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    Internship Guide
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleShowTool("projects")}
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    Project Ideas
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-base mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-500" aria-hidden="true" />
                Connect
              </h4>
              <ul className="space-y-2 text-sm font-medium">
                <li>
                  <a
                    href="https://www.linkedin.com/in/diptohello/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/60 hover:text-primary transition-colors"
                  >
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/dipto-hello"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"
                  >
                    <Github className="w-3.5 h-3.5" aria-hidden="true" />
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-foreground/50 font-medium text-xs">
              &copy; 2026 Student Success Hub. Crafted with passion.
            </p>
            <p className="text-foreground/50 font-medium text-xs">
              By{" "}
              <a
                href="https://github.com/dipto-hello"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-bold"
              >
                Dipto Sarker
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
