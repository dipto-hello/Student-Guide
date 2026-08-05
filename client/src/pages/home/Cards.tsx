import { memo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ChevronRight, Quote, Star } from "lucide-react";
import Tilt3DCard from "@/components/Tilt3DCard";
import { fadeUp } from "./motion";
import { glowColorFor, type Stat, type Testimonial, type Tool } from "./data";

/**
 * Presentational cards used by the landing page sections.
 *
 * All three are memoised: their props come from module-level constants, so
 * re-rendering them on every scroll/theme state change in Home is pure waste.
 */

export const StatCard = memo(function StatCard({ icon: Icon, value, label, color }: Stat) {
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

export const ToolCard = memo(function ToolCard({
  tool,
  onOpen,
}: {
  tool: Tool;
  onOpen: (id: string) => void;
}) {
  const Icon = tool.icon;

  return (
    <motion.div variants={fadeUp} className="relative z-10">
      <Tilt3DCard className="h-full" glowColor={glowColorFor(tool.iconBg)}>
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
            <h3 className="text-lg md:text-xl font-bold mb-2 text-foreground truncate">
              {tool.title}
            </h3>
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

export const TestimonialCard = memo(function TestimonialCard({ t }: { t: Testimonial }) {
  const initials = t.name
    .split(" ")
    .map((n) => n[0])
    .join("");

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
            {initials}
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
