import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { serverUrl } from "../constants";
import { 
  Zap, LogOut, Home as HomeIcon, PlusCircle, Globe, 
  Trash2, Sparkles, LayoutGrid, Palette, Loader2, 
  ArrowRight, CreditCard, Monitor, Search
} from "lucide-react";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [templateImg, setTemplateImg] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [credits, setCredits] = useState(0);
  const [deploying, setDeploying] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const textareaRef = useRef(null);
  
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;
  const API_URL = `${serverUrl}/api/website`;

  // 1. Sync Theme/Template Data
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

  // 2. Fetch Data
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

  const buyCredits = (amount) => {
    alert(`Redirecting to payment for ${amount} credits...`);
    // Future: Integrate Razorpay/Stripe here
  };

  const generateWebsite = () => {
    if (!prompt.trim()) return alert("Please describe your idea!");
    setLoading(true);
    setProgress(0);
    setStatusText("AI is conceptualizing...");

    const url = `${API_URL}/generate-stream?prompt=${encodeURIComponent(prompt)}`;

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
    if (!window.confirm("Sure?")) return;
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
            <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} className="text-red-500 font-medium text-sm px-2">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          
          {/* GENERATOR BOX */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><PlusCircle size={24} /></div>
              <h2 className="text-2xl font-bold italic">Create something amazing</h2>
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
              className={`mt-4 w-full py-5 rounded-2xl font-black text-xl flex items-center justify-center gap-3 transition-all ${loading ? 'bg-slate-200 text-slate-500' : 'bg-slate-900 hover:bg-blue-600 text-white shadow-xl shadow-blue-100 active:scale-95'}`}
            >
              {loading ? <><Loader2 className="animate-spin" /> {statusText} ({progress}%)</> : <><Sparkles /> GENERATE SITE</>}
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
                  onClick={() => buyCredits(item.c)}
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
        <div className="flex items-center gap-4 mb-8">
           <h3 className="text-2xl font-black text-slate-800">Your Projects</h3>
           <div className="flex-1 h-px bg-slate-200" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {websites.map((site, index) => (
            <div key={site._id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl transition-all group">
              {/* Web UI Preview Image */}
              <div className="h-44 bg-slate-100 relative overflow-hidden border-b border-slate-100">
                {/* Dashboard.jsx line 225 ke aas-paas */}
<img 
  src={`https://plus.unsplash.com/premium_photo-1678565812039-30d3581f0dc2?q=80&w=800&auto=format&fit=crop&sig=${index}`} 
  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90"
  alt="Web Preview"
/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                   <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold border border-white/20 uppercase tracking-tighter">AI Design System</div>
                </div>
              </div>

              <div className="p-6">
                <h4 className="text-lg font-black text-slate-800 mb-1 truncate">{site.title || "My Awesome Project"}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Last updated 2 mins ago</p>
                
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/preview/${site._id}`)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-xs font-black hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
                    Open Editor <ArrowRight size={14}/>
                  </button>
                  {site.deployedUrl && (
                    <button onClick={() => window.open(site.deployedUrl, '_blank')} className="px-4 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-100 transition-all">
                      <Globe size={16} />
                    </button>
                  )}
                </div>
                
                <button onClick={() => deleteWebsite(site._id)} className="w-full mt-4 flex items-center justify-center gap-1 text-slate-300 hover:text-red-500 transition-colors text-[10px] font-bold uppercase tracking-widest">
                  <Trash2 size={12}/> Remove Project
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