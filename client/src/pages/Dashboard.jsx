import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../firebase";
import { serverUrl } from "../constants";
import { 
  Zap, PlusCircle, Globe, Trash2, Sparkles, LayoutGrid, 
  Palette, Loader2, ArrowRight, CreditCard, Monitor // <--- Ye add karein
} from "lucide-react";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini"); // Default Model
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

  // Model Options
  const AI_MODELS = [
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", icon: "⚡", speed: "Fast" },
    { id: "openai/gpt-4o", name: "GPT-4o Premium", icon: "🧠", speed: "Smart" },
    { id: "anthropic/claude-3-haiku", name: "Claude Haiku", icon: "🎨", speed: "Creative" },
    { id: "google/gemini-pro-1.5", name: "Gemini 1.5 Pro", icon: "✨", speed: "Deep" },
  ];

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
    if (userData?.credits) setCredits(userData.credits);
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

  const generateWebsite = () => {
    if (!prompt.trim()) return alert("Please describe your idea!");
    setLoading(true);
    setProgress(0);
    setStatusText("AI is conceptualizing...");

    // Sending selectedModel as a query parameter
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
            if (data.done) {
              setCredits(data.remainingCredits);
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
    await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchWebsites();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white/90 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Zap size={20} className="text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight">GenSite <span className="text-blue-600">AI</span></span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden md:block" />
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button onClick={() => navigate("/templates")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-sm font-semibold text-slate-600">
                <LayoutGrid size={16} /> Templates
              </button>
              <button onClick={() => navigate("/themes")} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-lg transition-all text-sm font-semibold text-slate-600">
                <Palette size={16} /> Themes
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-bold text-sm flex items-center gap-2">
              <Sparkles size={14} /> {credits} Credits
            </div>
            <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} className="text-red-500 font-medium text-sm px-2 hover:underline">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          
          {/* GENERATOR BOX */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><PlusCircle size={24} /></div>
                    <h2 className="text-2xl font-bold italic text-slate-800">Create something amazing</h2>
                </div>

                {/* MODEL SELECTION DROPDOWN */}
                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase ml-2">AI Engine:</span>
                    <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-white border-none text-xs font-bold text-blue-600 px-3 py-1.5 rounded-xl outline-none cursor-pointer focus:ring-2 focus:ring-blue-100 transition-all"
                    >
                        {AI_MODELS.map(m => (
                            <option key={m.id} value={m.id}>{m.icon} {m.name} ({m.speed})</option>
                        ))}
                    </select>
                </div>
            </div>

            {templateImg && (
              <div className="mb-4 relative w-48 aspect-video rounded-xl overflow-hidden border-2 border-blue-500 shadow-lg">
                <img src={templateImg} className="w-full h-full object-cover" alt="Ref" />
                <button onClick={() => setTemplateImg(null)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-md"><Trash2 size={12}/></button>
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What kind of website are we building today? (e.g., A luxury watch store with dark aesthetics)"
              className="w-full h-40 bg-slate-50 border border-slate-200 rounded-[1.5rem] p-6 text-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-inner"
            />

            <button
              onClick={generateWebsite}
              disabled={loading}
              className={`mt-4 w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${loading ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 text-white shadow-xl shadow-blue-100 active:scale-95'}`}
            >
              {loading ? (
                <><Loader2 className="animate-spin" /> {statusText} ({progress}%)</>
              ) : (
                <><Sparkles /> GENERATE WITH {AI_MODELS.find(m => m.id === selectedModel)?.name.split(' ')[0].toUpperCase()}</>
              )}
            </button>
          </div>

          {/* CREDITS BUY BOX */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2.5rem] shadow-xl text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-black uppercase tracking-widest opacity-70">Credit Balance</span>
                <CreditCard size={20} className="opacity-70" />
              </div>
              <div className="text-6xl font-black mb-10 flex items-baseline gap-2">{credits} <span className="text-lg font-normal opacity-60 uppercase">Credits</span></div>
            </div>

            <div className="space-y-3">
              {[
                { c: 10, p: "₹99" },
                { c: 50, p: "₹399" },
                { c: 100, p: "₹699" }
              ].map((item) => (
                <button 
                  key={item.c}
                  onClick={() => alert(`Buy ${item.c} credits`)}
                  className="w-full py-3.5 px-5 bg-white/10 hover:bg-white/20 rounded-2xl border border-white/10 flex justify-between items-center transition-all group"
                >
                  <span className="font-bold flex items-center gap-2"><Zap size={14} className="text-yellow-400 fill-current"/> {item.c} Credits</span>
                  <span className="bg-white text-blue-700 px-3 py-1 rounded-lg text-xs font-black group-hover:scale-110 transition-transform">{item.p}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PROJECTS SECTION */}
       {/* PROJECTS SECTION HEADER */}
<div className="flex items-center justify-between mb-10">
  <div className="flex items-center gap-3">
    <div className="w-2 h-8 bg-blue-600 rounded-full" />
    <h3 className="text-3xl font-black text-slate-800 tracking-tight">Your Projects</h3>
  </div>
  <div className="hidden md:block flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent ml-8" />
  <div className="text-slate-400 text-sm font-medium ml-4">
    Total: {websites.length}
  </div>
</div>

{/* PROJECTS GRID */}
{/* PROJECTS GRID - Optimized */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
  {websites.length > 0 ? (
    websites.map((site, index) => (
      <div 
        key={site._id} 
        className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(59,130,246,0.12)] transition-all duration-500 flex flex-col h-full"
      >
        {/* IMAGE/PREVIEW AREA */}
        <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
          <img 
            src={`https://images.unsplash.com/photo-1460925895917?q=80&w=500&auto=format&fit=crop&sig=${index}`} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
            alt="Web Preview"
            onError={(e) => { e.target.src = "https://placehold.co/600x400/f1f5f9/64748b?text=GenSite+AI"; }}
          />
          
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl text-[10px] text-slate-800 font-bold border border-white/50 shadow-sm flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${site.deployed ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500'}`} />
              {site.deployed ? 'LIVE' : 'DRAFT'}
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="p-6 flex flex-col flex-1">
          <h4 className="text-lg font-black text-slate-800 mb-2 line-clamp-2 leading-tight min-h-[3rem]">
            {site.title || "Untitled Project"}
          </h4>
          
          <div className="flex items-center gap-2 mb-6">
            <Monitor size={14} className="text-slate-400" />
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
               Updated {new Date(site.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </p>
          </div>
          
          <div className="mt-auto flex gap-2">
            <button 
              onClick={() => navigate(`/preview/${site._id}`)} 
              className="flex-1 bg-slate-900 text-white py-3 rounded-2xl text-[11px] font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-100"
            >
              EDIT SITE <ArrowRight size={14}/>
            </button>
            
            {site.deployedUrl && (
              <button 
                onClick={() => window.open(site.deployedUrl, '_blank')} 
                className="w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
              >
                <Globe size={18} />
              </button>
            )}
          </div>
          
          {/* Subtle Delete */}
          <button 
            onClick={() => deleteWebsite(site._id)} 
            className="mt-4 text-[10px] font-bold text-slate-300 hover:text-red-500 transition-colors uppercase tracking-[0.1em] self-center"
          >
            Archive Project
          </button>
        </div>
      </div>
    ))
  ) :(
    /* EMPTY STATE - PROFESSIONAL STYLE */
    <div className="col-span-full py-24 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 shadow-inner">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <LayoutGrid className="text-slate-300" size={32} />
      </div>
      <h4 className="text-2xl font-bold text-slate-800 mb-2">No projects yet</h4>
      <p className="text-slate-400 max-w-xs mx-auto mb-8 font-medium">
        Your creative journey starts here. Describe your dream website and watch the AI bring it to life.
      </p>
      <button 
        onClick={() => textareaRef.current?.focus()}
        className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
      >
        Create Your First Site
      </button>
    </div>
  )}
</div>
      </main>
    </div>
  );
};

export default Dashboard;