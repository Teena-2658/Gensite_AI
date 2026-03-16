import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";
import { X, CheckCircle2, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { serverUrl } from "../constants";

const LoginModal = ({ open, onClose, setUser }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);

      const response = await axios.post(
        `${serverUrl}/api/auth/google`,
        {
          email: result.user.email,
          name: result.user.displayName,
          avatar: result.user.photoURL,
        },
        { withCredentials: true }
      );

      const userData = {
        ...response.data.user,
        token: response.data.token,
      };

      // Store in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Update parent state immediately
      if (setUser) setUser(userData);

      setShowSuccess(true);

      setTimeout(() => {
        onClose();
        window.location.href = "/dashboard";
      }, 1500);

    } catch (error) {
      console.error("Login Failed:", error);
      alert("Login Failed ❌. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <div className="relative w-full max-w-[400px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#0f172a] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Close Button */}
        {!showSuccess && (
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors z-10 p-1"
          >
            <X size={20} />
          </button>
        )}

        <div className="relative p-10 py-12">
          {!showSuccess ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                <Sparkles className="text-blue-500" size={32} />
              </div>

              <h2 className="text-3xl font-black text-white mb-3 tracking-tight">
                Welcome <span className="text-blue-500">Back</span>
              </h2>
              <p className="text-slate-400 text-sm mb-10 font-medium">
                Log in to access your AI design workspace
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="group relative w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-70 mb-6"
              >
                {loading ? (
                  <Loader2 className="animate-spin text-blue-600" size={20} />
                ) : (
                  <>
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="google"
                      className="w-5 h-5"
                    />
                    CONTINUE WITH GOOGLE
                  </>
                )}
              </button>

              <div className="flex items-center gap-4 text-slate-600 text-[10px] font-black uppercase tracking-widest mb-8">
                <div className="flex-1 h-px bg-slate-800"></div>
                <div className="flex items-center gap-1.5"><ShieldCheck size={12}/> Secure Access</div>
                <div className="flex-1 h-px bg-slate-800"></div>
              </div>
            </div>
          ) : (
            <div className="animate-in zoom-in-95 fade-in duration-500 text-center py-6">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                <div className="relative w-24 h-24 bg-green-500/10 rounded-full border border-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="text-green-500" size={48} />
                </div>
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">Authenticated</h2>
              <p className="text-green-500/80 font-bold text-sm uppercase tracking-widest mb-6">Success</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-xl border border-white/5 text-slate-400 text-xs font-medium">
                <Loader2 className="animate-spin" size={12} />
                Preparing your dashboard...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;