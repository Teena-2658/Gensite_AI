import React, { useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

const PaymentSuccess = () => {

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {

    const verifyPayment = async () => {

      try {

        const sessionId = searchParams.get("session_id");

        const res = await axios.post(
          "http://localhost:8000/api/payment/verify",
          { sessionId }
        );

        alert(`Credits added: ${res.data.creditsAdded}`);

        navigate("/dashboard");

      }

      catch (error) {

        console.error(error);
        alert("Payment verification failed");

        navigate("/dashboard");

      }

    };

    verifyPayment();

  }, []);

  return (

    <div className="min-h-screen flex items-center justify-center">

      <h1 className="text-3xl font-bold">
        Verifying payment...
      </h1>

    </div>

  );

};

export default PaymentSuccess;