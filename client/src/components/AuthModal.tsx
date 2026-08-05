import React, { useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

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

  const handleClose = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  // Prevent dialog from closing when Google popup steals focus
  const preventClose = useCallback((e: Event) => {
    e.preventDefault();
  }, []);

  const callbackRef = useRef((response: any) => {});

  useEffect(() => {
    callbackRef.current = async (response: { credential: string }) => {
      const success = await loginWithGoogle(response.credential);
      if (success) handleClose(false);
    };
  }, [loginWithGoogle]);

  // Initialize Google Sign-In when modal opens
  useEffect(() => {
    if (!open || !googleClientId) {
      // Only reset when closing, not on every render
      if (!open) isInitialized.current = false;
      return;
    }

    const initGoogle = () => {
      if (!window.google?.accounts?.id || !googleButtonRef.current) return;
      if (isInitialized.current) return;

      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (res: any) => callbackRef.current(res),
        auto_select: false,
        itp_support: true,
      });

      // Clear previous button safely
      while (googleButtonRef.current.firstChild) {
        googleButtonRef.current.removeChild(googleButtonRef.current.firstChild);
      }

      // Calculate a safe width for mobile screens
      const buttonWidth = Math.min(380, window.innerWidth - 80);

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: buttonWidth,
        logo_alignment: "left",
      });

      isInitialized.current = true;
    };

    // Small delay so the dialog DOM is fully ready
    const timer = setTimeout(initGoogle, 150);
    return () => clearTimeout(timer);
  }, [open, googleClientId]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-md bg-[#18191B] text-white border border-white/10 shadow-2xl rounded-[2rem] p-0 overflow-hidden"
        onPointerDownOutside={preventClose}
        onInteractOutside={preventClose}
        onFocusOutside={preventClose}
      >
        <DialogTitle className="sr-only">Authentication</DialogTitle>
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
                  minHeight: '44px',
                  backgroundColor: '#1f1f1f',
                }}
              >
                <div ref={googleButtonRef} className="w-full flex justify-center" />
              </div>
            ) : (
              <div className="w-full p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs text-center">
                <p className="font-semibold">Google Sign-In not configured</p>
                <p className="mt-1 text-amber-400/70">Add VITE_GOOGLE_CLIENT_ID to .env file</p>
              </div>
            )}

            {/* Skip for now Button */}
            <button
              onClick={() => handleClose(false)}
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
      </DialogContent>
    </Dialog>
  );
}
