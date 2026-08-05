import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { X } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Google's official mark. Inlined so it paints with the button, not after it. */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92a8.78 8.78 0 0 0 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86a5.4 5.4 0 0 1-5.08-3.74H.96v2.34A8.99 8.99 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.92 10.68a5.41 5.41 0 0 1 0-3.36V4.98H.96a8.99 8.99 0 0 0 0 8.04l2.96-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59A8.99 8.99 0 0 0 .96 4.98L3.92 7.32A5.4 5.4 0 0 1 9 3.58Z"
      />
    </svg>
  );
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { loginWithGoogle } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  /**
   * Google's rendered button is never shown.
   *
   * Its markup is injected asynchronously and then mutates again as GSI fetches
   * the logo and resolves the localized label — two visible content swaps we
   * cannot style or transition away, because the subtree belongs to Google.
   *
   * So it is kept present-but-invisible (it must stay in the layout tree or GSI
   * won't render it), and a button we own is shown instead. Clicking ours
   * forwards the click to Google's, inside the same user-gesture task so the
   * gesture is preserved. Nothing the user sees can blink, by construction.
   */
  const [isGoogleReady, setIsGoogleReady] = useState(false);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const callbackRef = useRef((_response: any) => {});

  useEffect(() => {
    callbackRef.current = async (response: { credential: string }) => {
      const success = await loginWithGoogle(response.credential);
      if (success) handleClose();
    };
  }, [loginWithGoogle, handleClose]);

  useEffect(() => {
    if (!open || !googleClientId) {
      if (!open) {
        isInitialized.current = false;
        setIsGoogleReady(false);
      }
      return;
    }

    let cancelled = false;
    let rafId = 0;

    const renderHiddenButton = () => {
      const container = googleButtonRef.current;
      if (!container || isInitialized.current) return;

      window.google!.accounts.id.initialize({
        client_id: googleClientId,
        callback: (res: any) => callbackRef.current(res),
        auto_select: false,
        itp_support: true,
      });

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

      window.google!.accounts.id.renderButton(container, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        logo_alignment: "left",
      });

      isInitialized.current = true;
      waitForClickTarget();
    };

    // Enable our button only once there is something to forward the click to,
    // so a click can never land on nothing.
    const waitForClickTarget = () => {
      if (cancelled) return;
      if (findClickTarget()) {
        setIsGoogleReady(true);
        return;
      }
      rafId = requestAnimationFrame(waitForClickTarget);
    };

    // The GSI script is loaded with `async defer`, so it may not be ready when
    // the modal opens. Poll rather than making a single timed attempt, which
    // would leave the button dead on a slow connection.
    const waitForSdk = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id) {
        renderHiddenButton();
        return;
      }
      rafId = requestAnimationFrame(waitForSdk);
    };

    waitForSdk();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [open, googleClientId]);

  /**
   * Locates the clickable node inside Google's injected subtree.
   * GSI renders a `[role="button"]`; the element child is a fallback in case
   * that internal structure changes.
   */
  function findClickTarget(): HTMLElement | null {
    const container = googleButtonRef.current;
    if (!container) return null;
    return (
      container.querySelector<HTMLElement>('[role="button"]') ??
      (container.firstElementChild as HTMLElement | null)
    );
  }

  const handleGoogleClick = () => {
    findClickTarget()?.click();
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
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
              aria-label="Close"
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
                  <div className="relative w-full">
                    {/*
                      Google's real button — invisible, but present in the layout
                      tree because GSI does not render into a display:none node.
                    */}
                    <div
                      ref={googleButtonRef}
                      aria-hidden="true"
                      className="absolute inset-0 opacity-0 pointer-events-none overflow-hidden"
                    />

                    <button
                      onClick={handleGoogleClick}
                      disabled={!isGoogleReady}
                      className="w-full h-12 rounded-full bg-white text-[#1f1f1f] font-semibold text-sm flex items-center justify-center gap-3 transition-[background-color,opacity] duration-200 hover:bg-zinc-100 disabled:opacity-60 disabled:cursor-default"
                    >
                      <GoogleLogo />
                      <span>Continue with Google</span>
                    </button>
                  </div>
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
