import React, { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import axios from "axios";
import { X } from "lucide-react";

const serverUrl = "http://localhost:8000";
// const serverUrl = import.meta.env.VITE_API_URL;

const LoginModal = ({ open, onClose }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Firebase login
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
        token: response.data.token
      };

      // Save user
      localStorage.setItem("user", JSON.stringify(userData));

      console.log("Saved user:", userData);

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        onClose();

        // ❌ dashboard redirect remove
        // window.location.replace("/dashboard");

        // ✔ stay on home and refresh UI
        window.location.reload();

      }, 2000);

    } catch (error) {
      console.error("Login Failed:", error);
      alert("Login Failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">

      {showSuccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50">
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 p-10 rounded-3xl text-white text-center shadow-2xl animate-scaleIn">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold">Login Successful!</h2>
            <p className="text-sm mt-2">Welcome to GenSite AI 🚀</p>
          </div>
        </div>
      )}

      <div className="relative w-[420px] rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f0f1a] to-[#07070c] p-8 shadow-2xl text-center">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="inline-block px-3 py-1 mb-6 text-xs rounded-full bg-white/10 text-gray-300 border border-white/10">
          AI-powered website builder
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome Back
        </h2>

        <p className="text-gray-400 text-sm mb-6">
          Continue with Google to generate your AI website
        </p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-3 w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="google"
            className="w-5 h-5"
          />
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="flex items-center gap-4 my-6 text-gray-500 text-sm">
          <div className="flex-1 h-px bg-gray-700"></div>
          Secure Login
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          By continuing, you agree to our{" "}
          <span className="underline cursor-pointer">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer">
            Privacy Policy
          </span>.
        </p>
      </div>
    </div>
  );
};

export default LoginModal;