import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {

  const [params] = useSearchParams();
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {

    const verify = async () => {

      try {

        const session_id = params.get("session_id");

        const res = await axios.post(
          "https://gensite-ai.onrender.com/api/payment/verify",
          { sessionId: session_id },
          { withCredentials: true }
        );

        setMessage(`✅ ${res.data.creditsAdded} credits added!`);

      } catch (error) {

        console.error(error);
        setMessage("❌ Payment verification failed");

      }

    };

    verify();

  }, [params]);

  return (
    <div style={{
      textAlign:"center",
      marginTop:"120px",
      fontFamily:"sans-serif"
    }}>
      <h1>{message}</h1>
    </div>
  );
};

export default PaymentSuccess;