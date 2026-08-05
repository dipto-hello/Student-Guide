import React, { useEffect, useRef, useState } from "react";
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

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { loginWithGoogle } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  // The Google button is injected asynchronously and cannot be styled by us, so
  // it is held at opacity 0 until GSI has actually painted it, then faded in.
  // Without this the button pops into an empty pill ~1s after the modal opens.
  const [isButtonReady, setIsButtonReady] = useState(false);

  const handleClose = () => {
    onOpenChange(false);
  };

  const callbackRef = useRef((response: any) => {});

  useEffect(() => {
    callbackRef.current = async (response: { credential: string }) => {
      const success = await loginWithGoogle(response.credential);
      if (success) handleClose();
    };
  }, [loginWithGoogle]);

  // Initialize Google Sign-In when modal opens
  useEffect(() => {
    if (!open || !googleClientId) {
      if (!open) {
        isInitialized.current = false;
        setIsButtonReady(false);
      }
      return;
    }

    let cancelled = false;
    let rafId = 0;

    const renderGoogleButton = () => {
      if (!googleButtonRef.current || isInitialized.current) return;

      window.google!.accounts.id.initialize({
        client_id: googleClientId,
        callback: (res: any) => callbackRef.current(res),
        auto_select: false,
        itp_support: true,
      });

      while (googleButtonRef.current.firstChild) {
        googleButtonRef.current.removeChild(googleButtonRef.current.firstChild);
      }

      // Calculate a safe width for mobile screens
      const buttonWidth = Math.min(380, window.innerWidth - 80);

      window.google!.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: buttonWidth,
        logo_alignment: "left",
      });

      isInitialized.current = true;
      waitForPaint();
    };

    // GSI fills the container asynchronously after renderButton returns. Reveal
    // only once it has real dimensions, so the fade covers the whole injection.
    const waitForPaint = () => {
      if (cancelled) return;
      const painted = googleButtonRef.current?.firstElementChild as HTMLElement | undefined;
      if (painted && painted.getBoundingClientRect().height > 0) {
        setIsButtonReady(true);
        return;
      }
      rafId = requestAnimationFrame(waitForPaint);
    };

    // The GSI script is loaded with `async defer`, so it may not be ready when
    // the modal opens. The previous implementation gave up after one attempt,
    // which left the button permanently missing on a slow connection.
    const waitForSdk = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id) {
        renderGoogleButton();
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
                {/* Real Google Sign-In Button */}
                {googleClientId ? (
                  <div
                    className="w-full flex justify-center items-center overflow-hidden rounded-full"
                    style={{
                      // Height is reserved up front so the injected button never
                      // shifts the surrounding layout.
                      height: '44px',
                      backgroundColor: '#1f1f1f',
                    }}
                  >
                    <div
                      ref={googleButtonRef}
                      className="w-full flex justify-center transition-opacity duration-300 ease-out"
                      style={{ opacity: isButtonReady ? 1 : 0 }}
                    />
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
