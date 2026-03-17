import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { serverUrl } from "../constants";
import { 
  Zap, PlusCircle, Globe, Trash2, Sparkles, LayoutGrid, 
  Palette, Loader2, ArrowRight, Monitor, LogOut, ExternalLink, Calendar, Rocket
} from "lucide-react";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini");
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deployingId, setDeployingId] = useState(null); 
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [credits, setCredits] = useState(0);
  const [showCreditPopup, setShowCreditPopup] = useState(false);
  
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

  const PRICING_PLANS = [
    { credits: 10, price: "99", icon: <Zap size={14} className="text-blue-500 fill-current" /> },
    { credits: 50, price: "399", icon: <Zap size={14} className="text-blue-500 fill-current" /> },
    { credits: 100, price: "699", icon: <Zap size={14} className="text-blue-500 fill-current" /> },
  ];

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  // Initial Sync
  useEffect(() => {
    if (!token) return navigate("/");
    setCredits(userData?.credits || 0);
    fetchWebsites();
  }, [token]);

  // Handle updates from other pages (Themes/Payment Success)
  useEffect(() => {
    if (location.state?.selectedPrompt) {
      setPrompt(location.state.selectedPrompt);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          window.scrollTo({ top: 150, behavior: 'smooth' });
        }
      }, 500);
    }
    if (location.state?.newCredits !== undefined) {
      setCredits(location.state.newCredits);
      // Sync localstorage just in case
      const updatedUser = { ...userData, credits: location.state.newCredits };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [location.state]);

  const fetchWebsites = async () => {
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setWebsites(Array.isArray(res.data) ? res.data : res.data.websites || []);
    } catch (error) { console.error("Fetch error:", error); }
  };

  // --- RE-INTEGRATED PAYMENT LOGIC ---
  const handlePayment = async (plan) => {
    try {
      // Endpoint ensure karein aapke backend se match kare (/create-checkout or /create-checkout-session)
      const res = await axios.post(`${serverUrl}/api/payment/create-checkout`, {
        credits: plan.credits
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment gateway failed to load.");
    }
  };

  const handleDeploy = async (id) => {
    setDeployingId(id);
    try {
      const res = await axios.put(`${API_URL}/deploy/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert("🚀 Website is now Live on Vercel!");
        if (res.data.deployedUrl) window.open(res.data.deployedUrl, '_blank');
        fetchWebsites();
      }
    } catch (error) {
      alert("Deployment failed: " + (error.response?.data?.message || error.message));
    } finally {
      setDeployingId(null);
    }
  };

  const generateWebsite = async () => {
    if (!prompt.trim()) return alert("Please describe your vision!");
    if (credits < 50) return setShowCreditPopup(true);

    setLoading(true);
    setProgress(0);
    setStatusText("AI is conceptualizing...");

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt, model: selectedModel })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          if (!event.startsWith("data:")) continue;
          const data = JSON.parse(event.replace("data:", "").trim());
          if (data.error) throw new Error(data.message);
          if (data.message) {
            setStatusText(data.message);
            setProgress((prev) => Math.min(prev + 10, 95));
          }
          if (data.remainingCredits !== undefined) {
            setCredits(data.remainingCredits);
            localStorage.setItem("user", JSON.stringify({ ...userData, credits: data.remainingCredits }));
          }
          if (data.websiteId) {
            setLoading(false);
            navigate(`/preview/${data.websiteId}`);
            return;
          }
        }
      }
    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
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
      
      {showCreditPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#0b1224] border border-white/10 rounded-2xl p-6 w-[340px] text-center shadow-2xl">
            <div className="text-xl font-bold text-white mb-2">⚡ Not Enough Credits</div>
            <p className="text-sm text-slate-400 mb-5">You need at least 50 credits to generate a website.</p>
            <button onClick={() => setShowCreditPopup(false)} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-xl font-semibold">OK</button>
          </div>
        </div>
      )}

      <nav className="fixed top-0 w-full z-50 bg-[#050816]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20"><Zap size={18} className="text-white fill-current" /></div>
              <span className="text-2xl font-bold tracking-tighter text-white">GenSite</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
              <button onClick={() => navigate("/templates")} className="px-3 py-1.5 hover:bg-white/5 rounded-lg text-xs font-medium text-slate-400 flex items-center gap-2 transition-all"><LayoutGrid size={16} /> Templates</button>
              <button onClick={() => navigate("/themes")} className="px-3 py-1.5 hover:bg-blue-500/10 hover:text-blue-400 rounded-lg text-xs font-medium text-slate-400 flex items-center gap-2 transition-all"><Palette size={16} /> Themes</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-bold text-sm flex items-center gap-2"><Sparkles size={14} /> {credits} Credits</div>
            <button onClick={() => { localStorage.removeItem("user"); navigate("/"); }} className="text-slate-500 hover:text-red-400 transition-colors"><LogOut size={18} /></button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 pt-32 pb-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          <div className="lg:col-span-2 bg-[#0b1224] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3"><PlusCircle className="text-blue-500" /> New Project</h2>
                <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="bg-[#050816] border border-white/10 text-slate-300 text-sm px-4 py-2 rounded-xl outline-none focus:border-blue-500 cursor-pointer">
                  {AI_MODELS.map((m) => (<option key={m.id} value={m.id}>{m.icon} {m.name}</option>))}
                </select>
            </div>
            <textarea ref={textareaRef} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe your vision..." className="w-full min-h-[120px] bg-[#050816] border border-white/10 rounded-2xl p-6 text-lg text-slate-200 focus:border-blue-600 outline-none transition-all placeholder:text-slate-700 resize-none leading-relaxed" />
            <button onClick={generateWebsite} disabled={loading} className={`mt-6 w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${loading ? "bg-white/5 text-slate-500" : "bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-600/20"}`}>
              {loading ? (<> <Loader2 className="animate-spin" /> {statusText} ({progress}%) </>) : (<> <Sparkles size={20} fill="white" /> Build Website </>)}
            </button>
          </div>

          {/* PAYMENT BOX */}
          <div className="bg-gradient-to-br from-[#0b1224] to-[#050816] border border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-between shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] pointer-events-none" />
             <div>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Credit Balance</span>
                <div className="text-7xl font-black mt-2 mb-10 text-white tracking-tighter">{credits}</div>
             </div>
             <div className="space-y-3 relative z-10">
                {PRICING_PLANS.map((plan) => (
                  <button key={plan.credits} onClick={() => handlePayment(plan)} className="w-full py-4 px-6 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl border border-white/5 flex justify-between items-center transition-all group">
                    <span className="flex items-center gap-2 text-slate-300 group-hover:text-white font-medium">{plan.icon} {plan.credits} Credits</span>
                    <span className="bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black text-white">₹{plan.price}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-10">
          <h3 className="text-2xl font-bold text-white tracking-tight uppercase">Recent Projects</h3>
          <div className="h-px flex-1 mx-8 bg-white/5 hidden md:block" />
        </div>

        {/* PROJECTS LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {websites.map((site) => (
            <div key={site._id} className="group bg-white/[0.02] border border-white/10 rounded-[2rem] overflow-hidden hover:border-blue-500 transition-all duration-500">
              <div className="aspect-[16/10] bg-[#161b22] relative flex items-center justify-center overflow-hidden border-b border-white/5">
                <div className="w-full h-full bg-gradient-to-br from-blue-600/20 via-transparent to-purple-600/10 flex items-center justify-center">
                   <div className="text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black text-blue-500 mb-2 mx-auto uppercase">{site.title ? site.title.charAt(0) : 'W'}</div>
                   </div>
                </div>
                {site.deployed && (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-[8px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <Globe size={10} /> LIVE
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050816] to-transparent opacity-60" />
              </div>

              <div className="p-8">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-lg font-bold text-white truncate flex-1">{site.title || "Untitled Project"}</h4>
                  {site.deployedUrl && (
                    <a href={site.deployedUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-white transition-colors ml-2">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-6">
                  <Calendar size={12} /> {new Date(site.createdAt).toLocaleDateString()}
                </div>

                <div className="space-y-3">
                  <button onClick={() => navigate(`/preview/${site._id}`)} className="w-full bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2">
                    <Monitor size={14} /> Open Editor
                  </button>
                  
                  <button 
                    onClick={() => handleDeploy(site._id)} 
                    disabled={deployingId === site._id}
                    className={`w-full py-3 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 border transition-all
                      ${site.deployed ? "bg-green-500/5 border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white" : "bg-blue-600/5 border-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white"}
                    `}
                  >
                    {deployingId === site._id ? (
                      <><Loader2 size={14} className="animate-spin" /> Deploying...</>
                    ) : (
                      <><Rocket size={14} /> {site.deployed ? "Update Live Site" : "Deploy to Vercel"}</>
                    )}
                  </button>

                  <button onClick={() => deleteWebsite(site._id)} className="w-full py-2 text-slate-600 hover:text-red-500 text-[10px] font-bold transition-colors flex items-center justify-center gap-1">
                    <Trash2 size={12} /> DELETE PROJECT
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;