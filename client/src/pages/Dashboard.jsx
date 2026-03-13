import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { serverUrl } from "../constants";
import { 
  Zap, PlusCircle, Globe, Trash2, Sparkles, LayoutGrid, 
  Palette, Loader2, ArrowRight, CreditCard, Monitor, LogOut
} from "lucide-react";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [templateImg, setTemplateImg] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [credits, setCredits] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;
  const API_URL = `${serverUrl}/api/website`;

  const AI_MODELS = [
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", icon: "⚡", speed: "Fast" },
    { id: "openai/gpt-4o", name: "GPT-4o Premium", icon: "🧠", speed: "Smart" },
    { id: "anthropic/claude-3-haiku", name: "Claude Haiku", icon: "🎨", speed: "Creative" },
    { id: "google/gemini-pro-1.5", name: "Gemini 1.5 Pro", icon: "✨", speed: "Deep" },
  ];

  useEffect(() => {

  if (location.state?.newCredits !== undefined) {

    setCredits(location.state.newCredits);

    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      user.credits = location.state.newCredits;
      localStorage.setItem("user", JSON.stringify(user));
    }

  }

}, [location.state]);
  useEffect(() => {
    if (location.state?.selectedPrompt) {
      setPrompt(location.state.selectedPrompt);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
      }, 300);
    }
    if (location.state?.selectedImage) {
      setTemplateImg(location.state.selectedImage);
    }
  }, [location.state]);

  useEffect(() => {
    if (!token) navigate("/");
    if (userData?.credits !== undefined) setCredits(userData.credits);
    if (token) fetchWebsites();
  }, [token]);

  const fetchWebsites = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWebsites(Array.isArray(res.data) ? res.data : res.data.websites || []);
    } catch (error) { console.error("Fetch error:", error); }
  };

  // --- STRIPE PAYMENT TRIGGER ---
  const handleBuyCredits = async (planCredits) => {
    try {
      const res = await axios.post(`${serverUrl}/api/payment/create-checkout`, 
        { credits: planCredits }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.url) window.location.href = res.data.url;
    } catch (error) {
      alert("Payment gateway failed to load.");
    }
  };

  const generateWebsite = () => {
    if (!prompt.trim()) return alert("Please describe your idea!");
    if (credits < 1) return alert("Insufficient credits. Please refill!");

    setLoading(true);
    setProgress(0);
    setStatusText("AI is conceptualizing...");

    const url = `${API_URL}/generate-stream?prompt=${encodeURIComponent(prompt)}&model=${selectedModel}`;

    fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` }
    }).then(async (response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split(/\r?\n\r?\n/);
        parts.slice(0, -1).forEach(part => {
          if (part.startsWith("data: ")) {
            const data = JSON.parse(part.replace("data: ", ""));
            if (data.percent !== undefined) setProgress(data.percent);
            if (data.text) setStatusText(data.text);
            
            // --- INSTANT DEDUCTION SYNC ---
            if (data.done) {
              setCredits(data.remainingCredits);
              const updatedUser = { ...userData, credits: data.remainingCredits };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              
              setPrompt("");
              setTemplateImg(null);
              fetchWebsites();
              setLoading(false);
            }
          }
        });
        buffer = parts[parts.length - 1];
      }
    }).catch(() => {
      alert("Error generating site");
      setLoading(false);
    });
  };

  const deleteWebsite = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchWebsites();
    } catch (e) { alert("Delete failed"); }
  };

return (
  <div className="min-h-screen bg-black text-gray-200 font-sans">
    
    {/* NAVBAR */}
    <nav className="bg-[#0f0f0f]/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
        
        <div className="flex items-center gap-6">
          
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap size={20} className="text-white fill-current" />
            </div>

            <span className="text-xl font-bold tracking-tight text-white">
              GenSite <span className="text-blue-500">AI</span>
            </span>
          </div>

          <div className="h-6 w-px bg-gray-800 hidden md:block" />

          <div className="flex items-center gap-2 bg-[#121212] p-1 rounded-xl border border-gray-800">
            
            <button
              onClick={() => navigate("/templates")}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-black rounded-lg transition text-sm font-semibold text-gray-400"
            >
              <LayoutGrid size={16} /> Templates
            </button>

            <button
              onClick={() => navigate("/themes")}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-black rounded-lg transition text-sm font-semibold text-gray-400"
            >
              <Palette size={16} /> Themes
            </button>

          </div>
        </div>

        <div className="flex items-center gap-4">

          <div className="px-4 py-2 bg-blue-900/30 text-blue-400 rounded-full border border-blue-900 font-bold text-sm flex items-center gap-2">
            <Sparkles size={14} /> {credits} Credits
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              navigate("/");
            }}
            className="text-red-400 font-medium text-sm px-2 hover:underline flex items-center gap-1"
          >
            <LogOut size={14} /> Logout
          </button>

        </div>
      </div>
    </nav>

    <main className="max-w-[1600px] mx-auto px-6 py-10">

      <div className="grid lg:grid-cols-3 gap-8 mb-16">

        {/* GENERATOR */}
        <div className="lg:col-span-2 bg-[#0f0f0f] p-8 rounded-[2rem] border border-gray-800 shadow-xl">

          <div className="flex justify-between mb-6">

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-xl text-blue-400">
                <PlusCircle size={24} />
              </div>

              <h2 className="text-2xl font-bold text-white">
                Create something amazing
              </h2>
            </div>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-black border border-gray-700 text-gray-300 text-sm px-3 py-2 rounded-lg"
            >
              {AI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.icon} {m.name}
                </option>
              ))}
            </select>

          </div>

          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your website..."
            className="w-full h-40 bg-black border border-gray-800 rounded-xl p-6 text-lg text-gray-300 focus:ring-2 focus:ring-blue-600 outline-none resize-none"
          />

          <button
            onClick={generateWebsite}
            disabled={loading}
            className={`mt-4 w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition
            ${
              loading
                ? "bg-gray-800 text-gray-400"
                : "bg-blue-600 hover:bg-blue-500 text-white"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> {statusText} ({progress}%)
              </>
            ) : (
              <>
                <Sparkles /> Generate Website
              </>
            )}
          </button>

        </div>

        {/* CREDIT PANEL */}
        <div className="bg-gradient-to-br from-black to-[#0f0f0f] border border-gray-800 p-8 rounded-[2rem] text-white flex flex-col justify-between">

          <div>
            <span className="text-xs uppercase text-gray-500">
              Credit Balance
            </span>

            <div className="text-6xl font-black mt-3 mb-10">
              {credits}
            </div>
          </div>

          <div className="space-y-3">
            {[
              { c: 10, p: "₹99" },
              { c: 50, p: "₹399" },
              { c: 100, p: "₹699" },
            ].map((item) => (
              <button
                key={item.c}
                onClick={() => handleBuyCredits(item.c)}
                className="w-full py-3 px-5 bg-[#111] hover:bg-[#1b1b1b] rounded-xl border border-gray-800 flex justify-between items-center"
              >
                <span className="flex items-center gap-2">
                  <Zap size={14} className="text-yellow-400" /> {item.c} Credits
                </span>

                <span className="bg-blue-600 px-3 py-1 rounded text-xs font-bold">
                  {item.p}
                </span>
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* PROJECTS */}
      <h3 className="text-3xl font-bold mb-8 text-white">
        Your Projects ({websites.length})
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">

        {websites.map((site) => (
          <div
            key={site._id}
            className="bg-[#0f0f0f] border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-600 transition"
          >
            
            <div className="aspect-[16/10] bg-black">
              <img
                src="https://images.unsplash.com/photo-1460925895917?q=80&w=500"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-6">

              <h4 className="text-lg font-bold text-white mb-2">
                {site.title || "Untitled Project"}
              </h4>

              <p className="text-xs text-gray-500 mb-4">
                {new Date(site.createdAt).toLocaleDateString()}
              </p>

              <div className="flex gap-2">

                <button
                  onClick={() => navigate(`/preview/${site._id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm"
                >
                  Edit
                </button>

                {site.deployedUrl && (
                  <button
                    onClick={() => window.open(site.deployedUrl, "_blank")}
                    className="w-10 bg-gray-800 flex items-center justify-center rounded-lg"
                  >
                    <Globe size={16} />
                  </button>
                )}
              </div>

              <button
                onClick={() => deleteWebsite(site._id)}
                className="text-xs text-red-400 mt-4"
              >
                Delete
              </button>

            </div>
          </div>
        ))}

      </div>

    </main>
  </div>
);
};

export default Dashboard;