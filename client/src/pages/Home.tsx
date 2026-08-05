import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { AuthModal } from "@/components/AuthModal";
import { Navbar } from "./home/Navbar";
import { HeroSection } from "./home/HeroSection";
import { StatsSection } from "./home/StatsSection";
import { AboutSection } from "./home/AboutSection";
import { ToolsSection } from "./home/ToolsSection";
import { FeaturesSection } from "./home/FeaturesSection";
import { TestimonialsSection } from "./home/TestimonialsSection";
import { Footer } from "./home/Footer";
import { tools } from "./home/data";

/**
 * Landing page shell.
 *
 * Holds only cross-section concerns — scroll state, the auth modal, and
 * navigation callbacks. Content, styling, and per-section state live in the
 * components under `./home`.
 */
export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [, setLocation] = useLocation();

  // Throttled with rAF: the raw scroll event fires far more often than the
  // single boolean the navbar actually cares about.
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // `?login=true` deep link opens the auth modal, then the query is stripped so
  // a refresh or back-navigation doesn't reopen it.
  useEffect(() => {
    if (window.location.search.includes("login=true")) {
      setIsAuthOpen(true);
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const handleShowTool = useCallback(
    (id: string) => {
      setLocation(`/tool/${id}`);
    },
    [setLocation],
  );

  const handleToolOpen = useCallback(
    (id: string) => {
      // A few tools are standalone routes; the rest render inside /tool/:id.
      const tool = tools.find((t) => t.id === id);
      setLocation(tool?.isRoute ? `/${id}` : `/tool/${id}`);
    },
    [setLocation],
  );

  const handleNavigateToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleOpenAuth = useCallback(() => setIsAuthOpen(true), []);
  const handleOpenProjects = useCallback(() => handleShowTool("projects"), [handleShowTool]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <AuthModal open={isAuthOpen} onOpenChange={setIsAuthOpen} />

      <Navbar
        scrolled={scrolled}
        onNavigateToSection={handleNavigateToSection}
        onOpenAuth={handleOpenAuth}
      />

      <HeroSection onNavigateToSection={handleNavigateToSection} />
      <StatsSection />
      <AboutSection />

      <div className="section-glow-divider mx-auto max-w-xl" />

      <ToolsSection onToolOpen={handleToolOpen} />

      <div className="section-glow-divider mx-auto max-w-xl" />

      <FeaturesSection onOpenProjects={handleOpenProjects} />
      <TestimonialsSection />
      <Footer onToolClick={handleShowTool} />
    </div>
  );
}
