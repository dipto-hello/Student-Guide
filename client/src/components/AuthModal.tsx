import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Official Google "G" mark, inlined so it needs no third-party script. */
function GoogleLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}

/**
 * Login modal.
 *
 * Sign-in is a plain top-level navigation to the server's OAuth entry point
 * (`/api/auth/google`), which redirects to Google and back. There is no
 * third-party widget to load, so nothing flickers while it initialises — the
 * long-standing cause of the button "blink" is gone by construction.
 */
export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [redirecting, setRedirecting] = useState(false);

  const handleClose = () => onOpenChange(false);

  const handleGoogleLogin = () => {
    setRedirecting(true);
    // Full-page navigation: the server sets the session cookie and returns the
    // browser to the SPA, so there is nothing async to await here.
    window.location.href = "/api/auth/google";
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[calc(100%-2rem)] max-w-md bg-[#18191B] text-white border border-white/10 shadow-2xl rounded-[2rem] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              aria-label="Close"
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-8 flex flex-col items-center text-center space-y-6">
              {/* Logo Icon */}
              <div className="w-16 h-16 rounded-2xl bg-[#242528] border border-white/10 flex items-center justify-center shadow-inner mt-2">
                <span className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white text-xl font-extrabold shadow-lg">
                  S
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1.5">
                <h2 className="text-2xl font-black tracking-tight text-white">Welcome to Student Hub</h2>
                <p className="text-sm text-zinc-400 font-medium">Unlock all features by logging in</p>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3 pt-2 flex flex-col items-center">
                {googleClientId ? (
                  <button
                    onClick={handleGoogleLogin}
                    disabled={redirecting}
                    className="w-full h-12 rounded-full bg-white text-[#1f1f1f] font-semibold text-sm flex items-center justify-center gap-3 transition-all hover:bg-zinc-100 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
                  >
                    {redirecting ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-zinc-400/40 border-t-zinc-600 animate-spin" />
                        Redirecting…
                      </>
                    ) : (
                      <>
                        <GoogleLogo />
                        Continue with Google
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center">
                    <p className="font-semibold">Google Sign-In not configured</p>
                    <p className="mt-1 text-amber-400/70">Add VITE_GOOGLE_CLIENT_ID to .env file</p>
                  </div>
                )}

                {/* Skip for now Button */}
                <button
                  onClick={handleClose}
                  className="w-full h-12 rounded-2xl bg-transparent hover:bg-white/5 text-zinc-400 hover:text-white font-semibold text-sm transition-all border border-white/10 mt-1"
                >
                  Skip for now
                </button>
              </div>

              {/* Footer Note */}
              <p className="text-[11px] text-zinc-500 font-medium pt-2">
                By logging in, you agree to our{" "}
                <a href="#" className="underline hover:text-zinc-300">Terms of Service</a> and{" "}
                <a href="#" className="underline hover:text-zinc-300">Privacy Policy</a>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
