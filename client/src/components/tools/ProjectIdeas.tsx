import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Globe,
  Smartphone,
  BarChart3,
  Brain,
  Database,
  Gamepad2,
  Sparkles,
  CheckCircle2,
  FolderGit2,
  Code2,
  LucideIcon,
  Lightbulb,
  Layers,
  Compass,
  Rocket,
  ExternalLink,
} from "lucide-react";

interface ProjectIdea {
  title: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

interface ProjectCategory {
  category: string;
  icon: LucideIcon;
  gradient: string;
  ideas: ProjectIdea[];
}

export default function ProjectIdeas() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories: ProjectCategory[] = [
    {
      category: "Web Development",
      icon: Globe,
      gradient: "from-blue-500 to-cyan-500",
      ideas: [
        { title: "Personal portfolio website", difficulty: "Beginner" },
        { title: "Todo app with local storage", difficulty: "Beginner" },
        { title: "Weather application", difficulty: "Intermediate" },
        { title: "E-commerce product page", difficulty: "Intermediate" },
        { title: "Blog platform", difficulty: "Advanced" },
      ],
    },
    {
      category: "Mobile Development",
      icon: Smartphone,
      gradient: "from-purple-500 to-pink-500",
      ideas: [
        { title: "Expense tracker app", difficulty: "Intermediate" },
        { title: "Fitness tracker", difficulty: "Intermediate" },
        { title: "Note-taking application", difficulty: "Beginner" },
        { title: "Quiz game", difficulty: "Beginner" },
        { title: "Habit tracker", difficulty: "Intermediate" },
      ],
    },
    {
      category: "Data Science",
      icon: BarChart3,
      gradient: "from-emerald-500 to-teal-500",
      ideas: [
        { title: "Movie recommendation system", difficulty: "Intermediate" },
        { title: "Sentiment analysis on tweets", difficulty: "Intermediate" },
        { title: "House price prediction", difficulty: "Advanced" },
        { title: "Customer segmentation", difficulty: "Intermediate" },
        { title: "Stock price analysis", difficulty: "Advanced" },
      ],
    },
    {
      category: "Machine Learning",
      icon: Brain,
      gradient: "from-amber-500 to-orange-500",
      ideas: [
        { title: "Image classification model", difficulty: "Intermediate" },
        { title: "Chatbot development", difficulty: "Advanced" },
        { title: "Handwriting recognition", difficulty: "Intermediate" },
        { title: "Spam email detection", difficulty: "Beginner" },
        { title: "Disease prediction model", difficulty: "Advanced" },
      ],
    },
    {
      category: "Database & Backend",
      icon: Database,
      gradient: "from-indigo-500 to-blue-600",
      ideas: [
        { title: "RESTful API for a social app", difficulty: "Intermediate" },
        { title: "User authentication system", difficulty: "Intermediate" },
        { title: "Real-time chat application", difficulty: "Advanced" },
        { title: "Inventory management system", difficulty: "Intermediate" },
        { title: "Library management system", difficulty: "Beginner" },
      ],
    },
    {
      category: "Game Development",
      icon: Gamepad2,
      gradient: "from-rose-500 to-violet-500",
      ideas: [
        { title: "2D platformer game", difficulty: "Advanced" },
        { title: "Puzzle game", difficulty: "Intermediate" },
        { title: "Snake game clone", difficulty: "Beginner" },
        { title: "Tic-tac-toe with AI", difficulty: "Intermediate" },
        { title: "Memory card game", difficulty: "Beginner" },
      ],
    },
  ];

  const filteredCategories =
    activeCategory === "All"
      ? categories
      : categories.filter((cat) => cat.category === activeCategory);

  const renderDifficultyBadge = (difficulty: "Beginner" | "Intermediate" | "Advanced") => {
    switch (difficulty) {
      case "Beginner":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Beginner
          </span>
        );
      case "Intermediate":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Intermediate
          </span>
        );
      case "Advanced":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            Advanced
          </span>
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="premium-card rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20">
              <Lightbulb className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Project Ideas Generator
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Discover hands-on project concepts categorized by track and difficulty level.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              30 Ideas Included
            </span>
          </div>
        </div>
      </motion.div>

      {/* Category Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
      >
        <button
          onClick={() => setActiveCategory("All")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
            activeCategory === "All"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
              : "premium-card text-gray-700 dark:text-gray-300 hover:text-orange-500"
          }`}
        >
          <Layers className="w-4 h-4" />
          All Categories
        </button>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.category;
          return (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20"
                  : "premium-card text-gray-700 dark:text-gray-300 hover:text-orange-500"
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.category}
            </button>
          );
        })}
      </motion.div>

      {/* Project Sections */}
      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {filteredCategories.map((section) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.category}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                exit={{ opacity: 0, y: -16 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${section.gradient} text-white shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                    {section.category}
                  </h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                    ({section.ideas.length} ideas)
                  </span>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                >
                  {section.ideas.map((idea, i) => (
                    <motion.div
                      key={i}
                      variants={itemVariants}
                      className="premium-card rounded-xl p-4 flex flex-col justify-between gap-3 hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                          <Code2 className="w-4 h-4" />
                        </div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-orange-500 transition-colors leading-snug">
                          {idea.title}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/60">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Difficulty</span>
                        {renderDifficultyBadge(idea.difficulty)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Tips for Project Selection */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="premium-card rounded-2xl p-6 relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">Tips for Choosing a Project</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Maximize your learning speed and consistency</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Choose something that interests you",
            "Start small and scale up",
            "Make sure it's achievable in your timeframe",
            "Focus on learning new skills",
            "Document your project well",
            "Deploy it and share on GitHub",
          ].map((tip, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{tip}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Portfolio Building */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="premium-card rounded-2xl p-6 relative overflow-hidden border-l-4 border-l-blue-500"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md shadow-blue-500/20">
            <FolderGit2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">Build Your Portfolio</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Stand out to recruiters and hiring managers</p>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Projects are excellent for building your portfolio. Here's how to maximize their value:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { text: "Host on GitHub with a clear README", icon: Rocket },
            { text: "Deploy live (Vercel, Heroku, Netlify)", icon: ExternalLink },
            { text: "Write about your learning process", icon: Sparkles },
            { text: "Include screenshots and interactive demos", icon: Code2 },
            { text: "Highlight challenges and solutions", icon: Layers },
          ].map((item, idx) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/10"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                  <ItemIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.text}</span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
