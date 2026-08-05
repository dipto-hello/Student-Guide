import { memo } from "react";
import { motion } from "framer-motion";
import { StatCard } from "./Cards";
import { staggerContainer } from "./motion";
import { stats } from "./data";

export const StatsSection = memo(function StatsSection() {
  return (
    <section className="py-6 relative z-20" aria-label="Statistics">
      <div className="container">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
        >
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </motion.div>
      </div>
    </section>
  );
});
