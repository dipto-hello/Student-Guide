import { memo } from "react";
import { BookOpen, Github, Link as LinkIcon, Zap } from "lucide-react";

export const Footer = memo(function Footer({
  onToolClick,
}: {
  onToolClick: (id: string) => void;
}) {
  return (
    <footer className="footer-surface pt-14 pb-8 relative z-10 mt-16" role="contentinfo">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-10">
          <div>
            <h4 className="font-bold text-base mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" aria-hidden="true" />
              Tools
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <button
                  onClick={() => onToolClick("cgpa")}
                  className="text-foreground/60 hover:text-primary transition-colors"
                >
                  CGPA Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onToolClick("study")}
                  className="text-foreground/60 hover:text-primary transition-colors"
                >
                  Study Manager
                </button>
              </li>
              <li>
                <button
                  onClick={() => onToolClick("exam")}
                  className="text-foreground/60 hover:text-primary transition-colors"
                >
                  Exam Prep
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-base mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-violet-500" aria-hidden="true" />
              Resources
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <button
                  onClick={() => onToolClick("resources")}
                  className="text-foreground/60 hover:text-primary transition-colors"
                >
                  Resource Library
                </button>
              </li>
              <li>
                <button
                  onClick={() => onToolClick("internship")}
                  className="text-foreground/60 hover:text-primary transition-colors"
                >
                  Internship Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onToolClick("projects")}
                  className="text-foreground/60 hover:text-primary transition-colors"
                >
                  Project Ideas
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-base mb-4 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-emerald-500" aria-hidden="true" />
              Connect
            </h4>
            <ul className="space-y-2 text-sm font-medium">
              <li>
                <a
                  href="https://www.linkedin.com/in/diptohello/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/60 hover:text-primary transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/dipto-hello"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5"
                >
                  <Github className="w-3.5 h-3.5" aria-hidden="true" />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-foreground/50 font-medium text-xs">
            &copy; 2026 Student Success Hub. Crafted with passion.
          </p>
          <p className="text-foreground/50 font-medium text-xs">
            By{" "}
            <a
              href="https://github.com/dipto-hello"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-bold"
            >
              Dipto Sarker
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
});
