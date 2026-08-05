import {
  BookOpen,
  Calculator,
  Clock,
  Zap,
  FileText,
  Link as LinkIcon,
  Briefcase,
  Star,
  Trophy,
  Users,
  Timer,
  type LucideIcon,
} from "lucide-react";

/**
 * Static content for the landing page.
 *
 * Kept out of the component tree so the section components stay presentational
 * and the copy can be edited without touching JSX.
 */

export interface Tool {
  id: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  iconBg: string;
  /** True when the tool is a top-level route rather than a /tool/:id page. */
  isRoute?: boolean;
}

export const NAV_ITEMS = ["about", "tools", "features", "testimonials"] as const;

export const NAV_LABELS: Record<string, string> = {
  testimonials: "Reviews",
  about: "About",
};

export const tools: readonly Tool[] = [
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
];

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  gradient: string;
}

export const testimonials: readonly Testimonial[] = [
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
];

export interface Stat {
  icon: LucideIcon;
  value: string;
  label: string;
  color: string;
}

export const stats: readonly Stat[] = [
  { icon: Users, value: "500+", label: "Students Helped", color: "text-indigo-500" },
  { icon: Calculator, value: "8+", label: "Premium Tools", color: "text-violet-500" },
  { icon: Trophy, value: "99%", label: "Success Rate", color: "text-orange-500" },
  { icon: Star, value: "4.9", label: "Average Rating", color: "text-amber-500" },
];

/** Maps a tool's accent class to the glow colour used by Tilt3DCard. */
const GLOW_BY_ACCENT: Array<[string, string]> = [
  ["indigo", "rgba(99,102,241,0.15)"],
  ["violet", "rgba(139,92,246,0.15)"],
  ["teal", "rgba(20,184,166,0.15)"],
  ["blue", "rgba(59,130,246,0.15)"],
  ["emerald", "rgba(16,185,129,0.15)"],
  ["orange", "rgba(249,115,22,0.15)"],
  ["pink", "rgba(236,72,153,0.15)"],
  ["cyan", "rgba(6,182,212,0.15)"],
  ["amber", "rgba(245,158,11,0.15)"],
];

const DEFAULT_GLOW = "rgba(99,102,241,0.15)";

export function glowColorFor(iconBg: string): string {
  return GLOW_BY_ACCENT.find(([accent]) => iconBg.includes(accent))?.[1] ?? DEFAULT_GLOW;
}
