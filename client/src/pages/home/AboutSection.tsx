import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Github, GraduationCap } from "lucide-react";

export const AboutSection = memo(function AboutSection() {
  return (
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
                    style={{ background: "linear-gradient(135deg, #6366F1, #A855F7, #EC4899)" }}
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
                <h3 className="text-3xl md:text-4xl font-black mb-2 text-foreground">
                  Dipto Sarker
                </h3>
                <p className="text-sm md:text-base text-foreground/80 font-semibold mb-4 flex items-center justify-center md:justify-start gap-2">
                  <GraduationCap className="w-5 h-5 text-violet-500" aria-hidden="true" />
                  Daffodil International University
                </p>

                <p className="text-foreground/70 text-sm md:text-base mb-6 leading-relaxed font-medium">
                  I engineered this comprehensive resource hub to help university students navigate
                  their academic journey seamlessly. This platform fuses practical tools, proven
                  strategies, and an ultra-modern aesthetic to help you excel.
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
  );
});
