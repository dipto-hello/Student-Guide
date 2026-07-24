import { motion } from "framer-motion";
import {
  StickyNote,
  GitBranch,
  List,
  Table2,
  CheckCircle2,
  BookOpen,
  Laptop,
  GraduationCap,
  Sparkles,
  Zap,
  Cloud,
  FileText
} from "lucide-react";

export default function NoteTaking() {
  const methods = [
    {
      name: "Cornell Method",
      desc: "Divide page into notes, cues, and summary sections",
      pros: ["Organized", "Good for review", "Structured"],
      icon: StickyNote,
      iconBg: "bg-blue-500/10 text-blue-500",
      badgeStyle: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20",
    },
    {
      name: "Mind Mapping",
      desc: "Create visual connections between concepts",
      pros: ["Visual learning", "Shows relationships", "Creative"],
      icon: GitBranch,
      iconBg: "bg-purple-500/10 text-purple-500",
      badgeStyle: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20",
    },
    {
      name: "Outline Method",
      desc: "Use hierarchical structure with main topics and subtopics",
      pros: ["Clear structure", "Easy to follow", "Good for exams"],
      icon: List,
      iconBg: "bg-emerald-500/10 text-emerald-500",
      badgeStyle: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
    },
    {
      name: "Charting Method",
      desc: "Use tables to organize information by categories",
      pros: ["Compares topics", "Organized", "Easy to review"],
      icon: Table2,
      iconBg: "bg-amber-500/10 text-amber-500",
      badgeStyle: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
    },
  ];

  const digitalTools = [
    {
      name: "OneNote",
      desc: "Free, syncs across devices",
      icon: Laptop,
      color: "text-purple-500",
    },
    {
      name: "Notion",
      desc: "Highly customizable, great for organization",
      icon: Sparkles,
      color: "text-blue-500",
    },
    {
      name: "Evernote",
      desc: "Cloud-based, good search functionality",
      icon: Cloud,
      color: "text-emerald-500",
    },
    {
      name: "Google Keep",
      desc: "Simple and quick notes",
      icon: Zap,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-3"
      >
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-500 dark:text-indigo-400">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Note Taking Strategies
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Master effective techniques to capture, structure, and retain knowledge
          </p>
        </div>
      </motion.div>

      {/* Methods Section */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <h4 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-500" />
          Popular Note-Taking Methods
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {methods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="premium-card rounded-2xl p-5 space-y-3 hover:border-indigo-500/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2.5 rounded-xl ${method.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h5 className="font-bold text-lg text-gray-900 dark:text-white">
                      {method.name}
                    </h5>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    {method.desc}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {method.pros.map((pro, i) => (
                    <span
                      key={i}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${method.badgeStyle}`}
                    >
                      {pro}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Best Practices & During Lectures Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Practices */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="premium-card rounded-2xl p-6 border-l-4 border-l-emerald-500 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              Best Practices
            </h4>
          </div>

          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Use your own words, don't copy verbatim</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Use abbreviations and symbols to save time</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Highlight key concepts and formulas</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Leave space for additional notes later</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Review and organize notes within 24 hours</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <span>Use consistent formatting and structure</span>
            </li>
          </ul>
        </motion.div>

        {/* During Lectures */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="premium-card rounded-2xl p-6 border-l-4 border-l-blue-500 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-lg text-gray-900 dark:text-white">
              During Lectures
            </h4>
          </div>

          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Listen actively and take selective notes</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Write down main ideas, not every word</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Mark topics that need clarification</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Ask questions if something is unclear</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
              <span>Review notes immediately after class</span>
            </li>
          </ul>
        </motion.div>
      </div>

      {/* Digital Note-Taking Tools */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="premium-card rounded-2xl p-6 border-l-4 border-l-purple-500 space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
            <Laptop className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg text-gray-900 dark:text-white">
            Digital Note-Taking Tools
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {digitalTools.map((tool, index) => {
            const ToolIcon = tool.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="premium-card rounded-xl p-4 space-y-2 border border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/40"
              >
                <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                  <ToolIcon className={`w-4 h-4 ${tool.color}`} />
                  <span>{tool.name}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {tool.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
