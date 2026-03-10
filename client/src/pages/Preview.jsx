import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  MessageSquare, 
  Code as CodeIcon, 
  Eye, 
  Send, 
  Loader2, 
  Sparkles,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle2,
  Settings2,
  Terminal,
  RefreshCw
} from "lucide-react";

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;

  const [website, setWebsite] = useState(null);
  const [code, setCode] = useState("");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [viewport, setViewport] = useState("desktop"); // desktop, tablet, mobile
  const [iframeKey, setIframeKey] = useState(0);

  const API_URL = "http://localhost:8000/api/website";

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, loading]);

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });
        const data = res.data.website || res.data;
        setWebsite(data);
        setCode(data.latestCode || "");
        if (data.conversation) setChat([...data.conversation]);
      } catch (error) {
        navigate("/dashboard");
      }
    };
    if (token && id) fetchWebsite();
  }, [id, token, navigate]);

  const sendChat = async () => {
    if (!chatInput.trim() || loading) return;
    const input = chatInput;
    setChat(prev => [...prev, { role: "user", content: input }]);
    setChatInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/generate`, 
        { prompt: `${website.title}. User request: ${input}`, websiteId: id },
        { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
      );

      if (res.data.code) {
        setCode(res.data.code);
        setIframeKey(prev => prev + 1);
        setChat(prev => [...prev, { 
          role: "ai", 
          content: `⚡ Refinement complete! I've updated the source code to reflect your changes.` 
        }]);
      }
    } catch (error) {
      setChat(prev => [...prev, { role: "ai", content: "Apologies, I hit a snag while updating. Please try that again." }]);
    } finally {
      setLoading(false);
    }
  };

  const viewportWidths = {
    desktop: "100%",
    tablet: "768px",
    mobile: "390px"
  };

  if (!website) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#F8FAFC]">
      <motion.div 
        animate={{ rotate: 360 }} 
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="mb-4"
      >
        <RefreshCw className="text-blue-600" size={32} />
      </motion.div>
      <p className="text-slate-400 font-bold text-sm tracking-widest uppercase">Initializing Studio</p>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#F1F5F9] text-slate-900 overflow-hidden">
      {/* GLOBAL HEADER */}
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <div className="p-1.5 rounded-md group-hover:bg-slate-100">
              <ArrowLeft size={18} />
            </div>
            <span className="text-xs font-black uppercase tracking-tighter">Back to Hub</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-200" />
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm font-black text-slate-800 tracking-tight">{website.title}</h1>
          </div>
        </div>

        {/* VIEWPORT CONTROLS */}
        {!codeEditorOpen && (
          <div className="hidden md:flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { id: 'mobile', icon: Smartphone },
              { id: 'tablet', icon: Tablet },
              { id: 'desktop', icon: Monitor }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewport(v.id)}
                className={`p-1.5 rounded-md transition-all ${viewport === v.id ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <v.icon size={16} />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onClick={() => setCodeEditorOpen(false)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-black transition-all ${!codeEditorOpen ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              <Eye size={14} /> PREVIEW
            </button>
            <button 
              onClick={() => setCodeEditorOpen(true)}
              className={`flex items-center gap-2 px-3 py-1 rounded-md text-[11px] font-black transition-all ${codeEditorOpen ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              <CodeIcon size={14} /> SOURCE
            </button>
          </div>
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-black transition-all active:scale-95"
          >
            <Save size={14} /> DEPLOY CHANGES
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* AI PANEL: GLASS DESIGN */}
        <aside className="w-[380px] bg-white border-r border-slate-200 flex flex-col shadow-xl">
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <Terminal size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-black text-[11px] uppercase tracking-widest text-slate-400">Assistant Engine</h2>
              <p className="text-xs font-bold text-slate-700">Llama 3 / GPT-4o Hybrid</p>
            </div>
            <button className="ml-auto text-slate-400 hover:text-slate-600"><Settings2 size={16}/></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            <AnimatePresence initial={false}>
              {chat.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.role === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[90%] p-3.5 rounded-2xl text-[13px] font-medium leading-relaxed shadow-sm ${
                    msg.role === "user" 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-slate-100 text-slate-700 border border-slate-200 rounded-tl-none"
                  }`}>
                    {msg.content}
                    {msg.role === 'ai' && (
                      <div className="mt-2 pt-2 border-t border-slate-200/50 text-[10px] font-bold flex items-center gap-1 opacity-60">
                        <CheckCircle2 size={10} className="text-emerald-500" /> SYNCED WITH CORE
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {loading && (
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity }} className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 text-[11px] font-bold text-blue-600 italic">
                  Compiling adjustments...
                </div>
              </motion.div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all border border-transparent focus-within:border-blue-200">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="E.g. 'Make the header sticky and blue'..."
                className="flex-1 bg-transparent px-3 py-2 text-xs font-medium outline-none"
                disabled={loading}
              />
              <button
                onClick={sendChat}
                disabled={loading || !chatInput.trim()}
                className="p-2.5 bg-slate-900 text-white rounded-lg hover:bg-blue-600 disabled:bg-slate-300 transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </aside>

        {/* WORKSPACE AREA */}
        <main className="flex-1 flex flex-col items-center bg-[#E2E8F0] overflow-hidden relative">
          {/* EDITOR / PREVIEW CANVAS */}
          <div 
            className="flex-1 transition-all duration-500 ease-in-out my-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-2xl overflow-hidden bg-white flex flex-col border border-slate-300"
            style={{ width: codeEditorOpen ? "100%" : viewportWidths[viewport], margin: codeEditorOpen ? "0" : "24px" }}
          >
            {/* CANVAS HEADER */}
            <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center justify-between px-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <div className="text-[10px] font-black text-slate-400 tracking-tighter uppercase">
                {codeEditorOpen ? "VIRTUAL_DOM_EDITOR.JS" : `LIVE_PREVIEW_${viewport.toUpperCase()}`}
              </div>
              <div />
            </div>

            <div className="flex-1 relative bg-white">
              {codeEditorOpen ? (
                <div className="h-full flex">
                   {/* CODE LINE NUMBERS Gutter */}
                   <div className="w-12 bg-slate-50 border-r border-slate-100 flex flex-col items-center py-6 text-[10px] font-mono text-slate-300 select-none">
                      {Array.from({length: 25}).map((_, i) => <div key={i}>{i+1}</div>)}
                   </div>
                   <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 p-6 font-mono text-[13px] text-slate-700 border-0 outline-none bg-[#fdfdfd] leading-relaxed resize-none"
                    spellCheck="false"
                  />
                </div>
              ) : (
                <iframe
                  key={iframeKey}
                  srcDoc={code}
                  title="preview"
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
          
          {/* SUBTLE BRANDING */}
          <div className="absolute bottom-4 right-6 flex items-center gap-2 pointer-events-none grayscale opacity-20">
             <Sparkles size={16} />
             <span className="text-[10px] font-black tracking-widest uppercase">GenSite Pro Engine</span>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Preview;