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

  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;

  const API_URL = "http://localhost:8000/api/website";


  // redirect if not logged in
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);


  // fetch websites
  const fetchWebsites = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true
      });

      const websitesData = Array.isArray(res.data)
        ? res.data
        : res.data.websites || [];

      setWebsites(websitesData);

    } catch (error) {
      console.error("Fetch websites error:", error);
    }
  };


  // generate website
  const generateWebsite = async () => {

    if (!prompt.trim()) {
      alert("Enter website idea");
      return;
    }

    if (!token) {
      alert("Please login first");
      navigate("/");
      return;
    }

    try {

      setLoading(true);

      await axios.post(
        `${API_URL}/generate`,
        { prompt },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      setPrompt("");
      fetchWebsites();
      alert("Website generated!");

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error generating site");
    } finally {
      setLoading(false);
    }
  };


  // preview
  const previewWebsite = (id) => {
    navigate(`/preview/${id}`);
  };


  // deploy
  const deployWebsite = async (id) => {

    try {

      setDeploying(id);

      await axios.put(
        `${API_URL}/deploy/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );

      alert("Website deployed successfully!");
      fetchWebsites();

    } catch (error) {
      console.error(error);
      alert("Failed to deploy website");
    } finally {
      setDeploying(null);
    }
  };


  // logout
  const handleLogout = async () => {

    try {

      await signOut(auth);
      localStorage.removeItem("user");
      navigate("/");

    } catch (error) {
      console.error("Logout error:", error);
    }
  };


  // load websites
  useEffect(() => {
    if (token) {
      fetchWebsites();
    }
  }, [token]);


  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

          <div className="text-2xl font-bold text-blue-600">
            GenSite AI
          </div>

          <div className="flex gap-4">
          <button
  onClick={() => navigate("/")}
  className="px-4 py-2 hover:bg-gray-100 rounded-lg"
>
  Back
</button>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>

        </div>
      </nav>


      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 py-8">

        <h1 className="text-4xl font-bold mb-8">
          My Projects
        </h1>


        {/* CREATE WEBSITE */}
        <div className="bg-gray-50 p-6 rounded-lg mb-8 border">

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
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

        </div>


        {/* PROJECTS GRID */}
        <div>

          <h2 className="text-2xl font-bold mb-4">
            Your Websites ({websites.length})
          </h2>

          {websites.length === 0 ? (

            <p className="text-gray-500 text-center py-8">
              No websites yet. Create one above!
            </p>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {websites.map((site) => (

                <div
                  key={site._id}
                  className="border rounded-lg p-4 hover:shadow-lg"
                >

                  <h3 className="text-lg font-bold mb-2">
                    {site.title}
                  </h3>

                  <p className="text-sm text-gray-500 mb-4">
                    {new Date(site.createdAt).toLocaleDateString()}
                  </p>

                  <div className="flex gap-2">

                    <button
                      onClick={() => previewWebsite(site._id)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => deployWebsite(site._id)}
                      disabled={deploying === site._id || site.deployed}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      {deploying === site._id
                        ? "Deploying..."
                        : site.deployed
                        ? "✓ Deployed"
                        : "Deploy"}
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
};

export default Dashboard;