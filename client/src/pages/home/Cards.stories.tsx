import type { Meta, StoryObj } from '@storybook/react-vite';
import { StatCard, TestimonialCard, ToolCard } from './Cards';
import { stats, testimonials, tools } from './data';

/**
 * The landing page's three card types. Args come from the same module-level
 * constants the real page renders, so a story drifting from production content
 * is impossible.
 */
const meta = {
  title: 'Home/Cards',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;

export const Stat: StoryObj = {
  render: () => (
    <div className="w-64">
      <StatCard {...stats[0]} />
    </div>
  ),
};

export const AllStats: StoryObj = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-[720px]">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  ),
};

export const Tool: StoryObj = {
  render: () => (
    <div className="w-80">
      <ToolCard tool={tools[0]} onOpen={() => {}} />
    </div>
  ),
};

/** Each tool carries its own accent colour — this catches a bad glow mapping. */
export const AllTools: StoryObj = {
  render: () => (
    <div className="grid grid-cols-3 gap-5 w-[1000px]">
      {tools.map((tool) => (
        <ToolCard key={tool.id} tool={tool} onOpen={() => {}} />
      ))}
    </div>
  ),
};

export const Testimonial: StoryObj = {
  render: () => (
    <div className="w-96">
      <TestimonialCard t={testimonials[0]} />
    </div>
  ),
};

export const AllTestimonials: StoryObj = {
  render: () => (
    <div className="grid grid-cols-3 gap-6 w-[1100px]">
      {testimonials.map((t) => (
        <TestimonialCard key={t.name} t={t} />
      ))}
    </div>
  ),
};
