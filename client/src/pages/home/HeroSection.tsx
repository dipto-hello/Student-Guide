import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import FloatingParticles from "@/components/FloatingParticles";

/** Decorative background gradients. Memoised — never re-renders. */
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

export const HeroSection = memo(function HeroSection({
  onNavigateToSection,
}: {
  onNavigateToSection: (id: string) => void;
}) {
  return (
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
            <span className="text-sm font-bold text-foreground">
              Your Complete Academic Toolkit
            </span>
          </motion.div>

          <h1 className="hero-title font-extrabold mb-6 text-5xl md:text-7xl tracking-tight leading-[1.1]">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block">
              Master Your
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block">
              Academic Journey
            </span>
          </h1>

          <p className="hero-subtitle text-lg md:text-xl text-foreground/70 mb-10 leading-relaxed font-medium max-w-2xl mx-auto">
            Elevate your grades with powerful tools for CGPA tracking, study planning, exam prep,
            and career guidance — all in one premium workspace.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                className="w-full sm:w-auto h-13 px-8 rounded-2xl cta-primary text-base border-0"
                onClick={() => onNavigateToSection("tools")}
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
                onClick={() => onNavigateToSection("about")}
              >
                About Creator
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
});
