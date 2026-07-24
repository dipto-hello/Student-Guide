import { motion } from "framer-motion";
import { 
  Briefcase, 
  CheckCircle2, 
  Target, 
  Building2, 
  Compass, 
  Globe,
  Award
} from "lucide-react";

export default function InternshipGuide() {
  const steps = [
    {
      title: "Prepare Your Resume",
      items: ["Highlight relevant skills", "Include projects and achievements", "Keep it concise (1 page)"],
    },
    {
      title: "Search for Opportunities",
      items: ["Check company websites", "Use LinkedIn and job portals", "Attend career fairs"],
    },
    {
      title: "Craft Cover Letter",
      items: ["Personalize for each company", "Show enthusiasm", "Highlight relevant experience"],
    },
    {
      title: "Apply & Follow Up",
      items: ["Submit applications early", "Follow up after 1-2 weeks", "Keep track of applications"],
    },
    {
      title: "Interview Preparation",
      items: ["Research the company", "Practice common questions", "Prepare your own questions"],
    },
    {
      title: "Succeed in Internship",
      items: ["Be proactive and reliable", "Learn as much as possible", "Build professional relationships"],
    },
  ];

  const interviewTips = [
    "Arrive 15 minutes early",
    "Dress professionally",
    "Make eye contact and smile",
    "Use the STAR method (Situation, Task, Action, Result)",
    "Ask thoughtful questions about the role and company",
    "Send a thank you email after the interview",
  ];

  const whatToLookFor = [
    "Relevant to your field of study",
    "Mentorship and learning opportunities",
    "Reasonable work hours and environment",
    "Competitive stipend (if applicable)",
    "Potential for full-time offer",
    "Good company culture and values",
  ];

  const jobPortals = [
    { name: "LinkedIn", desc: "Professional networking and job search" },
    { name: "Indeed", desc: "Largest job board with internship listings" },
    { name: "Glassdoor", desc: "Company reviews and salary information" },
    { name: "AngelList", desc: "Startup internships and jobs" },
  ];

  return (
    <div className="space-y-6">
      {/* Header section */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-center gap-3 pb-2 border-b border-gray-200/50 dark:border-gray-800/50"
      >
        <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-violet-600 text-white shadow-md shadow-purple-500/20">
          <Briefcase className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            Internship Guide
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Step-by-step roadmap to land and excel in your ideal internship</p>
        </div>
      </motion.div>

      {/* Step-by-Step Guide Vertical Timeline */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Compass className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-lg text-gray-900 dark:text-white">Step-by-Step Guide</h4>
        </div>

        <div className="relative pl-3 md:pl-4 space-y-6">
          {/* Vertical connecting line */}
          <div className="absolute left-[23px] md:left-[27px] top-4 bottom-6 w-0.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-violet-600 rounded-full opacity-40 dark:opacity-60" />

          {steps.map((step, idx) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="relative flex items-start gap-4"
            >
              {/* Step circle badge */}
              <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-violet-600 text-white font-bold text-sm shadow-md shadow-indigo-500/25 flex items-center justify-center z-10 shrink-0 ring-4 ring-white dark:ring-gray-900">
                {idx + 1}
              </div>

              {/* Step Card */}
              <div className="premium-card rounded-2xl p-5 flex-1 space-y-3">
                <h5 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                  {step.title}
                </h5>
                <ul className="grid sm:grid-cols-3 gap-2">
                  {step.items.map((item, i) => (
                    <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2 bg-white/40 dark:bg-gray-800/40 p-2 rounded-xl border border-gray-200/30 dark:border-gray-700/30">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Grid layout for Tips & What to look for */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Interview Tips Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="premium-card rounded-2xl p-5 border-l-4 border-l-blue-500 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white">Interview Tips</h4>
            </div>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              {interviewTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 bg-white/40 dark:bg-gray-800/40 p-2.5 rounded-xl border border-blue-500/10">
                  <span className="text-blue-500 font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* What to Look For Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="premium-card rounded-2xl p-5 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-transparent border-l-4 border-l-purple-500 flex flex-col justify-between space-y-4"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-gray-900 dark:text-white">What to Look For in an Internship</h4>
            </div>
            <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
              {whatToLookFor.map((item, i) => (
                <li key={i} className="flex items-start gap-2 bg-white/40 dark:bg-gray-800/40 p-2.5 rounded-xl border border-purple-500/10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* Popular Job Portals Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="premium-card rounded-2xl p-5 border-l-4 border-l-emerald-500 space-y-4"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Globe className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-lg text-gray-900 dark:text-white">Popular Job Portals</h4>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {jobPortals.map((portal) => (
            <div 
              key={portal.name}
              className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 border border-emerald-500/10 flex items-start gap-2.5"
            >
              <Building2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-gray-900 dark:text-white">{portal.name}: </span>
                <span className="text-gray-600 dark:text-gray-300">{portal.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
