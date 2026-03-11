import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";
import { serverUrl } from "../constants";
import { 
  Zap, 
  LogOut, 
  Home as HomeIcon, 
  PlusCircle, 
  Globe, 
  ExternalLink, 
  Copy, 
  Trash2, 
  CreditCard,
  Rocket,
  Loader2,
  Sparkles
} from "lucide-react";

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
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;

const API_URL = `${serverUrl}/api/website`;

  useEffect(() => {
    if (!token) navigate("/");
    if (userData?.credits) setCredits(userData.credits);
  }, [token, navigate]);

  const fetchWebsites = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const websitesData = Array.isArray(res.data) ? res.data : res.data.websites || [];
      setWebsites(websitesData);
    } catch (error) {
      console.error("Fetch websites error:", error);
    }
  };

  const buyCredits = async (creditsAmount) => {
    try {
      const res = await axios.post(`${serverUrl}/api/payment/checkout`, { credits: creditsAmount }, { headers: { Authorization: `Bearer ${token}` } });
    
      window.location.href = res.data.url;
    } catch (error) {
      alert("Payment failed");
    }
  };

  const generateWebsite = () => {
    if (!prompt.trim()) {
      alert("Please describe your website idea");
      return;
    }

    setLoading(true);
    setProgress(0);
    setStatusText("Analyzing your vision...");

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
      alert("Generation failed");
      setLoading(false);
    });
  };

  const deleteWebsite = async (id) => {
    if (!window.confirm("Delete this website permanently?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWebsites();
    } catch (error) {
      alert("Delete failed");
    }
  };

  const deployWebsite = async (id) => {
    try {
      setDeploying(id);
      const response = await axios.put(`${API_URL}/deploy/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeploymentUrls(prev => ({ ...prev, [id]: response.data.deployedUrl }));
      fetchWebsites();
    } catch (error) {
      alert("Failed to deploy");
    } finally {
      setDeploying(null);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Copied to clipboard!");
  };

  useEffect(() => {
    if (token) fetchWebsites();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600"
            >
              <HomeIcon size={20} />
            </motion.button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
                <Zap size={18} className="text-white fill-current" />
              </div>
              <span className="text-xl font-bold tracking-tight">GenSite <span className="text-blue-600">Dashboard</span></span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-bold text-sm">
              <Sparkles size={14} />
              {credits} Credits
            </div>
            <button
              onClick={() => signOut(auth).then(() => { localStorage.removeItem("user"); navigate("/"); })}
              className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* TOP SECTION: BENTO LAYOUT */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          
          {/* GENERATOR CARD */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <PlusCircle size={24} />
              </div>
              <h2 className="text-2xl font-bold">Build New Website</h2>
            </div>
            
            <textarea
              placeholder="E.g. A modern portfolio for a minimalist photographer with a dark theme..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-slate-700"
            />

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={generateWebsite}
              disabled={loading}
              className={`mt-4 w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-blue-600 shadow-blue-100'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating Magic...
                </>
              ) : (
                <>
                  <Sparkles size={20} /> Generate with AI
                </>
              )}
            </motion.button>

            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-blue-700 font-bold flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                    </span>
                    {statusText}
                  </span>
                  <span className="text-blue-700 font-black">{progress}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-blue-100 p-0.5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", bounce: 0, duration: 0.5 }}
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* CREDITS CARD */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-80 uppercase tracking-widest text-xs font-bold">
                <CreditCard size={14} /> Available Balance
              </div>
              <div className="text-5xl font-black mb-6">{credits} <span className="text-xl font-normal opacity-60">Credits</span></div>
              <p className="text-blue-100 text-sm mb-8 leading-relaxed">
                Unlock more professional features and high-speed generation with premium credits.
              </p>
            </div>
            
            <div className="space-y-3">
              {[100, 500, 1000].map((amount) => (
                <button
                  key={amount}
                  onClick={() => buyCredits(amount)}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-bold transition-all border border-white/10 flex justify-between px-4 items-center group"
                >
                  <span>{amount} Credits</span>
                  <span className="text-xs bg-white text-blue-700 px-2 py-1 rounded group-hover:bg-blue-50 transition-colors">BUY</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PROJECTS SECTION */}
       {/* PROJECTS SECTION */}
<div>
  <div className="flex items-center justify-between mb-8">
    <div className="space-y-1">
      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Your Ecosystem</h2>
      <p className="text-slate-500 text-sm font-medium">Manage and deploy your AI-generated masterpieces</p>
    </div>
    <div className="px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-2xl text-xs font-bold text-slate-600 uppercase tracking-wider">
      {websites.length} Websites
    </div>
  </div>

  {websites.length === 0 ? (
    <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200">
      <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <Globe className="text-slate-300" size={40} />
      </div>
      <h3 className="text-xl font-bold text-slate-900">No websites yet</h3>
      <p className="text-slate-500 mt-2">Your generated projects will appear here.</p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <AnimatePresence>
        {websites.map((site) => (
          <motion.div
            key={site._id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -8 }}
            className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300"
          >
            {/* WEBSITE PREVIEW AREA */}
            <div className="relative h-52 bg-slate-100 overflow-hidden group-hover:cursor-pointer" onClick={() => navigate(`/preview/${site._id}`)}>
              {/* Browser Mockup Header */}
              <div className="absolute top-0 left-0 right-0 h-7 bg-slate-200/50 backdrop-blur-md flex items-center px-4 gap-1.5 z-10 border-b border-slate-300/30">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="ml-2 h-3 w-24 bg-slate-300/50 rounded-full" />
              </div>

              {/* Dynamic Image/Pattern Placeholder */}
              <div className={`absolute inset-0 pt-7 flex items-center justify-center transition-transform duration-700 group-hover:scale-110 bg-gradient-to-br ${site.deployedUrl ? 'from-emerald-50 to-teal-100' : 'from-blue-50 to-indigo-100'}`}>
                {/* You can eventually replace this <img> tag with site.screenshotUrl */}
                <div className="relative">
                   <div className="absolute -inset-4 bg-white/40 blur-xl rounded-full" />
                   <Globe size={80} className={`${site.deployedUrl ? 'text-emerald-300' : 'text-blue-300'} relative`} />
                </div>
                
                {/* Floating "Hover to View" Overlay */}
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                   <div className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-xs flex items-center gap-2 shadow-xl translate-y-4 group-hover:translate-y-0 transition-all">
                      <ExternalLink size={14} /> View Details
                   </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute bottom-4 left-4 flex gap-2 z-10">
                {site.deployedUrl ? (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Live
                  </span>
                ) : (
                  <span className="bg-slate-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-lg">
                    Draft
                  </span>
                )}
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="p-7">
              <div className="mb-5">
                <h3 className="text-xl font-bold text-slate-800 truncate mb-1">
                  {site.title || "Untitled Project"}
                </h3>
                <p className="text-slate-400 text-xs font-medium flex items-center gap-1">
                   Created {new Date(site.createdAt).toLocaleDateString()}
                </p>
              </div>

              {site.deployedUrl && (
                <div className="mb-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group/url">
                  <div className="truncate pr-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Deployment URL</p>
                    <p className="text-xs text-blue-600 font-bold truncate tracking-tight">{site.deployedUrl.replace('https://', '')}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); copyToClipboard(site.deployedUrl); }} 
                    className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-blue-600"
                  >
                    <Copy size={16} />
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate(`/preview/${site._id}`)}
                  className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                  Edit Site
                </button>

                {!site.deployedUrl ? (
                  <button
                    onClick={() => deployWebsite(site._id)}
                    disabled={deploying === site._id}
                    className="flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 disabled:bg-slate-200 transition-all active:scale-95 shadow-lg shadow-blue-100"
                  >
                    {deploying === site._id ? <Loader2 className="animate-spin" size={18} /> : <Rocket size={18} />}
                    Deploy
                  </button>
                ) : (
                  <button
                    onClick={() => window.open(site.deployedUrl, '_blank')}
                    className="flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-bold hover:bg-emerald-100 transition-all border border-emerald-100"
                  >
                    <ExternalLink size={18} /> Visit
                  </button>
                )}
                
                <button
                  onClick={() => deleteWebsite(site._id)}
                  className="col-span-2 flex items-center justify-center gap-2 py-2 text-slate-400 hover:text-red-500 rounded-xl text-[11px] font-bold transition-all mt-2 opacity-60 hover:opacity-100"
                >
                  <Trash2 size={12} /> Delete Permanently
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )}
</div>
      </main>
    </div>
  );
};

export default Dashboard;