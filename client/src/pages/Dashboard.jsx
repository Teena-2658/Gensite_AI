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
  const [deploymentUrls, setDeploymentUrls] = useState({});

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
const generateWebsite = () => {

  if (!prompt.trim()) {
    alert("Enter website idea");
    return;
  }

  setLoading(true);
  setProgress(0);
  setStatusText("Starting...");

  const url = `${API_URL}/generate-stream?prompt=${encodeURIComponent(prompt)}`;

  fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(async (response) => {

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    let buffer = "";

    while (true) {

      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");

      parts.slice(0, -1).forEach(part => {

        if (part.startsWith("data: ")) {

          const data = JSON.parse(part.replace("data: ", ""));

          if (data.percent !== undefined) {
            setProgress(data.percent);
          }

          if (data.text) {  
            setStatusText(data.text);
          }

        if (data.done) {

  setCredits(data.remainingCredits);

  // update localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  user.credits = data.remainingCredits;
  localStorage.setItem("user", JSON.stringify(user));

  setPrompt("");
  fetchWebsites();

  setTimeout(() => {
    setLoading(false);
    setProgress(0);
    setStatusText("");
  }, 1500);

}
          if (data.error) {
            alert(data.message);
            setLoading(false);
          }

        }

      });

      buffer = parts[parts.length - 1];

    }

  }).catch(err => {

    console.error(err);
    alert("Generation failed");
    setLoading(false);

  });

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

      const response = await axios.put(
        `${API_URL}/deploy/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { deployedUrl } = response.data;

      setDeploymentUrls(prev => ({
        ...prev,
        [id]: deployedUrl
      }));

      fetchWebsites();

      alert(`✅ Deployed! URL: ${deployedUrl}`);

    }

    catch (error) {

      console.error(error);
      alert("Failed to deploy website: " + error.response?.data?.message || error.message);

    }

    finally {

      setDeploying(null);

    }

  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
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

  <div className="mt-6">

    <div className="flex justify-between text-sm mb-1">
      <span>{statusText}</span>
      <span className="font-bold">{progress}%</span>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">

      <div
        className="bg-blue-600 h-4 rounded-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      />

    </div>

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

                {site.deployedUrl ? (
                  <div className="mb-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 rounded-lg">
                    <p className="text-xs text-green-700 font-bold mb-2">🚀 LIVE WEBSITE</p>
                    <a 
                      href={site.deployedUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-sm text-blue-600 hover:text-blue-800 hover:underline break-all font-medium mb-2"
                    >
                      {site.deployedUrl}
                    </a>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(site.deployedUrl)}
                        className="flex-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 font-semibold"
                      >
                        📋 Copy URL
                      </button>
                      <button
                        onClick={() => window.open(site.deployedUrl, '_blank')}
                        className="flex-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
                      >
                        🔗 Open Site
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="flex gap-2">

                  <button
                    onClick={() => previewWebsite(site._id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Preview
                  </button>

                  {!site.deployedUrl && (
                    <button
                      onClick={() => deployWebsite(site._id)}
                      disabled={deploying === site._id}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                      {deploying === site._id ? "Deploying..." : "Deploy"}
                    </button>
                  )}

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