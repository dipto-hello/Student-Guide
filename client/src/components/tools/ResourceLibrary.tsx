import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ExternalLink, 
  GraduationCap, 
  Code, 
  Search, 
  Wrench, 
  BookOpen, 
  Lightbulb, 
  Sparkles,
  Filter
} from "lucide-react";

export default function ResourceLibrary() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    { id: "All", label: "All Resources", icon: BookOpen },
    { id: "Online Learning", label: "Online Learning", icon: GraduationCap },
    { id: "Programming", label: "Programming", icon: Code },
    { id: "Research", label: "Research", icon: Search },
    { id: "Productivity", label: "Productivity", icon: Wrench },
  ];

  const resources = [
    {
      category: "Online Learning Platforms",
      tag: "Online Learning",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-500",
      items: [
        { name: "Coursera", url: "https://www.coursera.org", desc: "University-level courses" },
        { name: "edX", url: "https://www.edx.org", desc: "Free courses from top universities" },
        { name: "Khan Academy", url: "https://www.khanacademy.org", desc: "Free educational videos" },
        { name: "Udemy", url: "https://www.udemy.com", desc: "Affordable skill-based courses" },
      ],
    },
    {
      category: "Programming & Tech",
      tag: "Programming",
      icon: Code,
      color: "from-purple-500 to-indigo-500",
      items: [
        { name: "GitHub", url: "https://github.com", desc: "Code hosting and collaboration" },
        { name: "Stack Overflow", url: "https://stackoverflow.com", desc: "Q&A for programmers" },
        { name: "LeetCode", url: "https://leetcode.com", desc: "Coding interview prep" },
        { name: "Codecademy", url: "https://www.codecademy.com", desc: "Interactive coding lessons" },
      ],
    },
    {
      category: "Research & Reference",
      tag: "Research",
      icon: Search,
      color: "from-emerald-500 to-teal-500",
      items: [
        { name: "Google Scholar", url: "https://scholar.google.com", desc: "Academic paper search" },
        { name: "ResearchGate", url: "https://www.researchgate.net", desc: "Research collaboration" },
        { name: "Wikipedia", url: "https://www.wikipedia.org", desc: "General knowledge reference" },
        { name: "Wolfram Alpha", url: "https://www.wolframalpha.com", desc: "Computational knowledge" },
      ],
    },
    {
      category: "Productivity & Organization",
      tag: "Productivity",
      icon: Wrench,
      color: "from-amber-500 to-orange-500",
      items: [
        { name: "Notion", url: "https://www.notion.so", desc: "All-in-one workspace" },
        { name: "Trello", url: "https://trello.com", desc: "Task and project management" },
        { name: "Pomodoro Timer", url: "https://pomofocus.io", desc: "Focus timer for studying" },
        { name: "Google Drive", url: "https://drive.google.com", desc: "Cloud storage and docs" },
      ],
    },
  ];

  const filteredResources = activeCategory === "All" 
    ? resources 
    : resources.filter(r => r.tag === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header section with gradient title */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/50 dark:border-gray-800/50"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-md shadow-orange-500/20">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Resource Library
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Curated tools and platforms for academic success</p>
          </div>
        </div>
      </motion.div>

      {/* Category Filter Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
      >
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium mr-1 flex-shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Filter:</span>
        </div>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]"
                  : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
            </button>
          );
        })}
      </motion.div>

      {/* Resource Sections */}
      <div className="space-y-8">
        {filteredResources.map((section, idx) => {
          const IconComponent = section.icon;
          return (
            <motion.div
              key={section.category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${section.color} text-white shadow-sm`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-100">
                  {section.category}
                </h4>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {section.items.map((item, i) => (
                  <motion.a
                    key={item.name}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (idx * 4 + i) * 0.04 }}
                    className="premium-card rounded-2xl p-4.5 hover:scale-[1.02] transition-all duration-300 group block relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h5 className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors">
                            {item.name}
                          </h5>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-gray-400 group-hover:text-orange-500 group-hover:bg-orange-500/10 dark:group-hover:bg-orange-500/20 transition-all flex-shrink-0">
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pro Tips Box */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="premium-card rounded-2xl p-5 border-l-4 border-l-emerald-500 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-transparent"
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
            Pro Tips
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </h4>
        </div>
        <ul className="grid sm:grid-cols-2 gap-2.5 text-xs text-gray-600 dark:text-gray-300">
          <li className="flex items-start gap-2 bg-white/40 dark:bg-gray-800/40 p-2.5 rounded-xl border border-emerald-500/10">
            <span className="text-emerald-500 font-bold">•</span>
            <span>Bookmark your favorite resources for quick access</span>
          </li>
          <li className="flex items-start gap-2 bg-white/40 dark:bg-gray-800/40 p-2.5 rounded-xl border border-emerald-500/10">
            <span className="text-emerald-500 font-bold">•</span>
            <span>Explore multiple platforms to find what works best for you</span>
          </li>
          <li className="flex items-start gap-2 bg-white/40 dark:bg-gray-800/40 p-2.5 rounded-xl border border-emerald-500/10">
            <span className="text-emerald-500 font-bold">•</span>
            <span>Many platforms offer free trials or student discounts</span>
          </li>
          <li className="flex items-start gap-2 bg-white/40 dark:bg-gray-800/40 p-2.5 rounded-xl border border-emerald-500/10">
            <span className="text-emerald-500 font-bold">•</span>
            <span>Combine resources for a comprehensive learning experience</span>
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
