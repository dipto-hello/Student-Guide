import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Featured call-out for the Project Ideas Generator. */
export const FeaturesSection = memo(function FeaturesSection({
  onOpenProjects,
}: {
  onOpenProjects: () => void;
}) {
  return (
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
            onClick={onOpenProjects}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpenProjects();
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
                  Get inspired with project ideas across Web Dev, Mobile, Data Science, AI, and Game
                  Dev. The perfect catalyst for your next big portfolio piece.
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
  );
});
