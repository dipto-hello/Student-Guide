import { memo, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { ToolCard } from "./Cards";
import { staggerContainer } from "./motion";
import { tools } from "./data";

export const ToolsSection = memo(function ToolsSection({
  onToolOpen,
}: {
  onToolOpen: (id: string) => void;
}) {
  const spotlightRef = useRef<HTMLDivElement>(null);

  /**
   * Cursor-following spotlight.
   *
   * Written straight to `style` rather than through React state — this fires on
   * every mousemove, and a state update per event would re-render the whole
   * grid at pointer frequency.
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!spotlightRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    spotlightRef.current.style.background = `radial-gradient(600px circle at ${x}px ${y}px, rgba(99,102,241,0.08), transparent 40%)`;
  }, []);

  return (
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
            <ToolCard key={tool.id} tool={tool} onOpen={onToolOpen} />
          ))}
        </motion.div>
      </div>
    </section>
  );
});
