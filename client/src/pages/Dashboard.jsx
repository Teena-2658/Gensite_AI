import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { serverUrl } from "../constants";
import { 
  Zap, PlusCircle, Globe, Trash2, Sparkles, LayoutGrid, 
  Palette, Loader2, ArrowRight, CreditCard, Monitor, LogOut, Layers
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


  // Dashboard.jsx snippets

// Effect 1: Listen for navigation state (from PaymentSuccess)
useEffect(() => {
  if (location.state?.refresh) {
    const updatedUser = JSON.parse(localStorage.getItem("user"));
    if (updatedUser?.credits !== undefined) {
      setCredits(updatedUser.credits);
    }
  }
}, [location.state]);

// Effect 2: Comprehensive Initial Load
useEffect(() => {
  if (!token) {
    navigate("/");
    return;
  }

  // Always pull the latest credits from localStorage on mount
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.credits !== undefined) {
    setCredits(user.credits);
  }
  
  fetchWebsites();
}, [token]);
  // Logic for syncing credits and prompts remains the same...
  useEffect(() => {
    if (location.state?.newCredits !== undefined) {
      setCredits(location.state.newCredits);
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) { user.credits = location.state.newCredits; localStorage.setItem("user", JSON.stringify(user)); }
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
  }, [location.state]);

  useEffect(() => {
    if (!token) navigate("/");
    if (userData?.credits !== undefined) setCredits(userData.credits);
    if (token) fetchWebsites();
  }, [token]);

  const fetchWebsites = async () => {
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setWebsites(Array.isArray(res.data) ? res.data : res.data.websites || []);
    } catch (error) { console.error("Fetch error:", error); }
  };

  const handleBuyCredits = async (planCredits) => {
    try {
      const res = await axios.post(`${serverUrl}/api/payment/create-checkout`, { credits: planCredits }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.url) window.location.href = res.data.url;
    } catch (error) { alert("Payment gateway failed to load."); }
  };

  const generateWebsite = () => {
    if (!prompt.trim()) return alert("Please describe your idea!");
    if (credits < 1) return alert("Insufficient credits!");
    setLoading(true); setProgress(0); setStatusText("AI is conceptualizing...");

    const url = `${API_URL}/generate-stream?prompt=${encodeURIComponent(prompt)}&model=${selectedModel}`;
    fetch(url, { method: "GET", headers: { Authorization: `Bearer ${token}` } }).then(async (response) => {
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
            if (data.done) {
              setCredits(data.remainingCredits);
              const updatedUser = { ...userData, credits: data.remainingCredits };
              localStorage.setItem("user", JSON.stringify(updatedUser));
              setPrompt(""); fetchWebsites(); setLoading(false);
            }
          }
        });
        buffer = parts[parts.length - 1];
      }
    }).catch(() => { alert("Error generating site"); setLoading(false); });
  };

  const deleteWebsite = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchWebsites();
    } catch (e) { alert("Delete failed"); }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* NAVBAR - Synced with Home */}
      <nav className="fixed top-0 w-full z-50 bg-[#050816]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Zap size={18} className="text-white fill-current" />
              </div>
              <span className="text-2xl font-bold tracking-tighter text-white">GenSite</span>
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <button onClick={() => navigate("/templates")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition text-sm font-medium text-slate-400">
                <LayoutGrid size={16} /> Templates
              </button>
              <button onClick={() => navigate("/themes")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/5 rounded-lg transition text-sm font-medium text-slate-400">
                <Palette size={16} /> Themes
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-bold text-sm flex items-center gap-2">
              <Sparkles size={14} /> {credits} Credits
            </div>
            <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} className="text-slate-500 hover:text-red-400 font-medium text-sm flex items-center gap-1 transition-colors">
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 pt-32 pb-16">
        
        {/* TOP GRID */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">

          {/* GENERATOR - Matches Chat Interface Style */}
          <div className="lg:col-span-2 bg-[#0b1224] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between mb-8 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
                  <PlusCircle size={24} />
                </div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Create your vision</h2>
              </div>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="bg-[#050816] border border-white/10 text-slate-300 text-sm px-4 py-2 rounded-xl outline-none focus:border-blue-500 transition-all"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{m.icon} {m.name}</option>
                ))}
              </select>
            </div>

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your website (e.g. 'A modern portfolio for a photographer with a dark theme')..."
              className="w-full h-48 bg-[#050816] border border-white/10 rounded-[1.5rem] p-6 text-lg text-slate-200 focus:ring-2 focus:ring-blue-600/40 focus:border-blue-600 outline-none resize-none transition-all placeholder:text-slate-600"
            />

            <button
              onClick={generateWebsite}
              disabled={loading}
              className={`mt-6 w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 
              ${loading ? "bg-white/5 text-slate-500" : "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/30 hover:-translate-y-1"}`}
            >
              {loading ? (
                <> <Loader2 className="animate-spin" /> {statusText} ({progress}%) </>
              ) : (
                <> <Sparkles size={20} fill="white" /> Generate Website </>
              )}
            </button>
          </div>

          {/* CREDIT PANEL - Gradient Style */}
          <div className="bg-gradient-to-br from-[#0b1224] to-[#050816] border border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] pointer-events-none" />
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500 font-black">Credit Balance</span>
              <div className="text-7xl font-black mt-4 mb-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                {credits}
              </div>
            </div>

            <div className="space-y-3 relative z-10">
              {[ { c: 10, p: "₹99" }, { c: 50, p: "₹399" }, { c: 100, p: "₹699" } ].map((item) => (
                <button
                  key={item.c}
                  onClick={() => handleBuyCredits(item.c)}
                  className="w-full py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl border border-white/5 flex justify-between items-center transition-all group"
                >
                  <span className="flex items-center gap-2 text-slate-300 group-hover:text-white font-medium">
                    <Zap size={14} className="text-blue-500 fill-current" /> {item.c} Credits
                  </span>
                  <span className="bg-blue-600 px-3 py-1 rounded-lg text-xs font-black text-white">{item.p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PROJECTS SECTION */}
        <div className="flex items-center justify-between mb-10">
          <h3 className="text-4xl font-black text-white tracking-tight">Your Projects</h3>
          <div className="h-px flex-1 mx-8 bg-white/5 hidden md:block" />
          <span className="px-4 py-1 bg-white/5 rounded-full border border-white/10 text-slate-500 text-sm font-bold">
            {websites.length} Total
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {websites.map((site) => (
            <div key={site._id} className="group bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden hover:border-blue-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-600/10">
              <div className="aspect-[16/10] bg-[#050816] overflow-hidden relative">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917?q=80&w=500" 
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                  alt="Site preview"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1224] to-transparent opacity-60" />
              </div>

              <div className="p-8">
                <h4 className="text-xl font-bold text-white mb-2 truncate group-hover:text-blue-400 transition-colors">
                  {site.title || "Untitled Project"}
                </h4>
                <p className="text-xs text-slate-500 mb-6 font-medium uppercase tracking-widest">
                  {new Date(site.createdAt).toLocaleDateString()}
                </p>

                <div className="flex gap-3">
                  <button onClick={() => navigate(`/preview/${site._id}`)} className="flex-1 bg-white text-black py-3 rounded-xl text-sm font-black hover:bg-slate-200 transition-all">
                    Edit
                  </button>
                  {site.deployedUrl && (
                    <button onClick={() => window.open(site.deployedUrl, "_blank")} className="w-12 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center rounded-xl border border-white/10 transition-all">
                      <Globe size={18} />
                    </button>
                  )}
                </div>

                <button onClick={() => deleteWebsite(site._id)} className="text-xs text-slate-600 hover:text-red-500 mt-6 flex items-center gap-2 transition-colors mx-auto">
                  <Trash2 size={12} /> Delete Permanently
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