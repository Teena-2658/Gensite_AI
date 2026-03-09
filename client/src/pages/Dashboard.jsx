import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Dashboard = () => {

  const [prompt, setPrompt] = useState("");
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(null);

  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [credits, setCredits] = useState(0);

  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const userData = storedUser ? JSON.parse(storedUser) : null;
  const token = userData?.token;

  const API_URL = "http://localhost:8000/api/website";
  const PAYMENT_API = "http://localhost:8000/api/payment";


  /*
  -----------------------------------
  REDIRECT IF NOT LOGGED IN
  -----------------------------------
  */
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);


  /*
  -----------------------------------
  LOAD USER CREDITS
  -----------------------------------
  */
  useEffect(() => {
    if (userData?.credits) {
      setCredits(userData.credits);
    }
  }, []);


  /*
  -----------------------------------
  FETCH WEBSITES
  -----------------------------------
  */
  const fetchWebsites = async () => {

    try {

      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const websitesData = Array.isArray(res.data)
        ? res.data
        : res.data.websites || [];

      setWebsites(websitesData);

    } catch (error) {

      console.error("Fetch websites error:", error);

    }

  };


  /*
  -----------------------------------
  BUY CREDITS (STRIPE)
  -----------------------------------
  */
  const buyCredits = async (credits) => {

    try {

      const user = JSON.parse(localStorage.getItem("user"));

      const res = await axios.post(
        "http://localhost:8000/api/payment/checkout",
        { credits },
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      window.location.href = res.data.url;

    } catch (error) {
      console.error(error);
      alert("Payment failed");
    }

  };


  /*
  -----------------------------------
  GENERATE WEBSITE
  -----------------------------------
  */
  const generateWebsite = async () => {

    if (!prompt.trim()) {
      alert("Enter website idea");
      return;
    }

    try {

      setLoading(true);

      setProgress(10);
      setStatusText("Preparing prompt...");

      await new Promise(r => setTimeout(r, 400));

      setProgress(30);
      setStatusText("Sending request to AI...");

      const res = await axios.post(
        `${API_URL}/generate`,
        { prompt },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setProgress(70);
      setStatusText("Saving website...");

      await new Promise(r => setTimeout(r, 500));

      setProgress(100);
      setStatusText("Website generated successfully!");

      if (res.data?.remainingCredits !== undefined) {
        setCredits(res.data.remainingCredits);
      }

      setPrompt("");
      fetchWebsites();

      setTimeout(() => {
        setProgress(0);
        setStatusText("");
      }, 1500);

    }

    catch (err) {

      console.error(err);
      alert(err.response?.data?.message || "Error generating site");

    }

    finally {

      setLoading(false);

    }

  };


  /*
  -----------------------------------
  PREVIEW
  -----------------------------------
  */
  const previewWebsite = (id) => {
    navigate(`/preview/${id}`);
  };


  /*
  -----------------------------------
  DEPLOY
  -----------------------------------
  */
  const deployWebsite = async (id) => {

    try {

      setDeploying(id);

      await axios.put(
        `${API_URL}/deploy/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert("Website deployed successfully!");

      fetchWebsites();

    }

    catch (error) {

      console.error(error);
      alert("Failed to deploy website");

    }

    finally {

      setDeploying(null);

    }

  };


  /*
  -----------------------------------
  LOGOUT
  -----------------------------------
  */
  const handleLogout = async () => {

    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/");

  };


  useEffect(() => {
    if (token) fetchWebsites();
  }, [token]);


  return (

    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

          <div className="flex items-center gap-4">

            <button
              onClick={() => navigate("/")}
              className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 text-sm"
            >
              ← Home
            </button>

            <div className="text-2xl font-bold text-blue-600">
              GenSite AI
            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="px-4 py-1 bg-yellow-100 text-yellow-800 rounded-full font-semibold text-sm">
              Credits: {credits}
            </div>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
            >
              Logout
            </button>

          </div>

        </div>

      </nav>


      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="mb-8">

          <h1 className="text-4xl font-bold">
            Dashboard
          </h1>

          <p className="text-gray-500">
            Create and manage your AI websites
          </p>

        </div>


        {/* BUY CREDITS */}
        <div className="bg-purple-50 border p-6 rounded-xl mb-8">

          <h2 className="text-xl font-bold mb-4">
            Buy Credits
          </h2>

          <div className="flex gap-4">

            <button
              onClick={() => buyCredits(100)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              100 Credits
            </button>

            <button
              onClick={() => buyCredits(500)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              500 Credits
            </button>

            <button
              onClick={() => buyCredits(1000)}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg"
            >
              1000 Credits
            </button>

          </div>

        </div>


        {/* CREATE WEBSITE */}
        <div className="bg-white p-6 rounded-xl mb-8 border">

          <h2 className="text-2xl font-bold mb-4">
            Create New Website
          </h2>

          <textarea
            placeholder="Describe your website idea..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-3 border rounded-lg h-24"
          />

          <button
            onClick={generateWebsite}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold"
          >
            {loading ? "Generating..." : "Generate"}
          </button>


          {loading && (

            <div className="mt-4">

              <div className="w-full bg-gray-200 rounded-full h-3">

                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />

              </div>

              <p className="text-sm text-gray-600 mt-2">
                {statusText}
              </p>

            </div>

          )}

        </div>


        {/* PROJECTS */}
        <div>

          <h2 className="text-2xl font-bold mb-4">
            Your Websites ({websites.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {websites.map((site) => (

              <div
                key={site._id}
                className="border rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
              >

                <h3 className="text-lg font-bold mb-3">
                  {site.title}
                </h3>

                <div className="flex gap-2">

                  <button
                    onClick={() => previewWebsite(site._id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded"
                  >
                    Preview
                  </button>

                  <button
                    onClick={() => deployWebsite(site._id)}
                    disabled={deploying === site._id}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded"
                  >
                    {deploying === site._id ? "Deploying..." : "Deploy"}
                  </button>

                </div>

              </div>

            ))}

          </div>

        </div>

      </div>

    </div>

  );

};

export default Dashboard;