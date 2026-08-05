import { memo } from "react";
import { motion } from "framer-motion";
import { TestimonialCard } from "./Cards";
import { staggerContainer } from "./motion";
import { testimonials } from "./data";

export const TestimonialsSection = memo(function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="py-20 md:py-24 relative z-10"
      aria-labelledby="testimonials-heading"
    >
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
          {testimonials.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
});
