import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { serverUrl } from "../constants";
import { Loader2, CheckCircle } from "lucide-react";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const [message, setMessage] = useState("Verifying your payment...");
  const [isDone, setIsDone] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verify = async () => {
      try {
        const session_id = params.get("session_id");
        if (!session_id) return;

        const res = await axios.post(
          `${serverUrl}/api/payment/verify`, 
          { sessionId: session_id }
        );

        if (res.data.success) {
          // --- CRITICAL STEP: Sync Local Storage ---
          const user = JSON.parse(localStorage.getItem("user"));
          if (user) {
            user.credits = res.data.newBalance; // Backend se naya balance update karein
            localStorage.setItem("user", JSON.stringify(user));
          }

          setMessage(`Success! ${res.data.creditsAdded} Credits added.`);
          setIsDone(true);

          // Redirect to dashboard with refresh state
          setTimeout(() => {
            navigate("/dashboard", { state: { refresh: true } });
          }, 2000);
        }
      } catch (error) {
        console.error(error);
        setMessage("Verification failed. Please check your dashboard.");
      }
    };

    verify();
  }, [params, navigate]);

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">
      <div className="text-center bg-[#0b1224] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl">
        {isDone ? (
          <CheckCircle className="mx-auto text-green-500 mb-4" size={50} />
        ) : (
          <Loader2 className="mx-auto animate-spin text-blue-500 mb-4" size={50} />
        )}
        <h1 className="text-2xl font-bold mb-2">{message}</h1>
        <p className="text-slate-500 text-sm">Do not refresh or close this page.</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;