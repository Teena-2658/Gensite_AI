import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
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
  Sparkles,
  LayoutGrid
} from "lucide-react";

const Dashboard = () => {
  const [prompt, setPrompt] = useState("");
  const [templateImg, setTemplateImg] = useState(null); // Template Image State
  const [websites, setWebsites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(null);
  const [deploymentUrls, setDeploymentUrls] = useState({});
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [credits, setCredits] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;
  const API_URL = `${serverUrl}/api/website`;

  // 1. Handle incoming Template Data
  useEffect(() => {
    if (location.state) {
      if (location.state.selectedPrompt || location.state.autoPrompt) {
        setPrompt(location.state.selectedPrompt || location.state.autoPrompt);
      }
      if (location.state.selectedImage) {
        setTemplateImg(location.state.selectedImage);
      }
      
      // Cleanup location state to prevent re-setting on refresh
      const timer = setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  // 2. Initial Data Fetch
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
      const websitesData = Array.isArray(res.data) ? res.data : res.data.websites || [];
      setWebsites(websitesData);
    } catch (error) {
      console.error("Fetch websites error:", error);
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
              setTemplateImg(null); // Clear template image after success
              fetchWebsites();
              
              if (data.websiteId) autoDeploy(data.websiteId);

              setTimeout(() => {
                setLoading(false);
                setProgress(0);
                setStatusText("");
              }, 1500);
            }
          }
        });
        buffer = parts[parts.length - 1];
      }
    }).catch(() => {
      alert("Generation failed");
      setLoading(false);
    });
  };

  // Rest of functions (autoDeploy, deleteWebsite, deployWebsite, copyToClipboard)
  const autoDeploy = async (newSiteId) => {
    try {
      setDeploying(newSiteId);
      const response = await axios.put(`${API_URL}/deploy/${newSiteId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) fetchWebsites();
    } catch (error) { console.error(error); } finally { setDeploying(null); }
  };

  const deleteWebsite = async (id) => {
    if (!window.confirm("Delete permanently?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchWebsites();
    } catch (error) { alert("Delete failed"); }
  };

  const deployWebsite = async (id) => {
    try {
      setDeploying(id);
      const response = await axios.put(`${API_URL}/deploy/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (response.data.success) fetchWebsites();
    } catch (error) { alert("Deployment failed"); } finally { setDeploying(null); }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    alert("Copied!");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/")} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
              <HomeIcon size={20} />
            </button>
            <button 
              onClick={() => navigate("/templates")}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-colors font-medium text-sm ${location.pathname === "/templates" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <LayoutGrid size={18} />
              <span>Templates</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg"><Zap size={18} className="text-white fill-current" /></div>
              <span className="text-xl font-bold tracking-tight">GenSite <span className="text-blue-600">Dashboard</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-bold text-sm">
              <Sparkles size={14} /> {credits} Credits
            </div>
            <button onClick={() => signOut(auth).then(() => { localStorage.removeItem("user"); navigate("/"); })} className="text-red-500 font-medium text-sm px-4">Logout</button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          
          {/* GENERATOR BOX */}
          <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><PlusCircle size={24} /></div>
              <h2 className="text-2xl font-bold">Build New Website</h2>
            </div>

            {/* Template Image Preview Section */}
            {templateImg && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mb-4 relative w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden border border-slate-200 group">
                <img src={templateImg} className="w-full h-full object-cover" alt="Selected" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button onClick={() => setTemplateImg(null)} className="bg-white text-red-600 p-2 rounded-full font-bold shadow-lg"><Trash2 size={16} /></button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-[10px] font-bold uppercase py-1 text-center">Selected Style</div>
              </motion.div>
            )}

            <textarea
              placeholder="E.g. A modern luxury jewelry ecommerce store..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-slate-700"
            />

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={generateWebsite}
              disabled={loading}
              className={`mt-4 w-full py-4 rounded-2xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${loading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-blue-600'}`}
            >
              {loading ? <><Loader2 className="animate-spin" size={20} /> {statusText}</> : <><Sparkles size={20} /> Generate with AI</>}
            </motion.button>

            {loading && (
              <div className="mt-8 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-blue-700 font-bold">{statusText}</span>
                  <span className="text-blue-700 font-black">{progress}%</span>
                </div>
                <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-blue-100 p-0.5">
                  <motion.div className="h-full bg-blue-600 rounded-full" animate={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* CREDITS BOX */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[2rem] shadow-xl text-white flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase opacity-80 mb-2">Available Balance</div>
              <div className="text-5xl font-black mb-6">{credits} <span className="text-xl font-normal opacity-60 text-white">Credits</span></div>
            </div>
            <div className="space-y-3">
              {[100, 500, 1000].map((amount) => (
                <button key={amount} onClick={() => buyCredits(amount)} className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all border border-white/10 flex justify-between px-4 items-center">
                  <span>{amount} Credits</span>
                  <span className="text-xs bg-white text-blue-700 px-2 py-1 rounded">BUY</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PROJECTS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {websites.map((site) => (
            <div key={site._id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all p-7">
               <h3 className="text-xl font-bold text-slate-800 mb-4">{site.title || "Untitled Project"}</h3>
               <div className="flex gap-2 mb-4">
                 <button onClick={() => navigate(`/preview/${site._id}`)} className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-sm font-bold">Edit</button>
                 {site.deployedUrl ? 
                   <button onClick={() => window.open(site.deployedUrl, '_blank')} className="flex-1 border border-emerald-100 bg-emerald-50 text-emerald-700 py-2 rounded-xl text-sm font-bold">Visit</button> :
                   <button onClick={() => deployWebsite(site._id)} className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-sm font-bold">Deploy</button>
                 }
               </div>
               <button onClick={() => deleteWebsite(site._id)} className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 mx-auto"><Trash2 size={12}/> Delete</button>
            </div>
          ))}
        </div>
      </main> 
    </div>
  );
};

export default Dashboard;