import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Send, Monitor, Smartphone, Tablet, 
  Terminal, Paperclip, X, Loader2, Zap, Code2, Eye, 
  ChevronLeft, ExternalLink, RefreshCw
} from "lucide-react";

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;

  const [website, setWebsite] = useState(null);
  const [code, setCode] = useState(""); 
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewport, setViewport] = useState("desktop");
  const [selectedImage, setSelectedImage] = useState(null);
  const [mode, setMode] = useState("preview"); // 'preview' or 'code'

  const API_URL = "http://localhost:8000/api/website";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  // Handle Ctrl+V Paste for Images
  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          const reader = new FileReader();
          reader.onloadend = () => setSelectedImage(reader.result);
          reader.readAsDataURL(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data.website || res.data;
        setWebsite(data);
        setCode(data.latestCode || "");
        if (data.conversation) setChat([...data.conversation]);
      } catch (error) { navigate("/dashboard"); }
    };
    if (token && id) fetchWebsite();
  }, [id, token, navigate]);

  const sendChat = async () => {
    if ((!chatInput.trim() && !selectedImage) || loading) return;
    const input = chatInput;
    const imgData = selectedImage;
    
    setChat(prev => [...prev, { role: "user", content: input || "Update design", attachedImg: imgData }]);
    setChatInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/generate`, 
        { prompt: input, websiteId: id, imageBase64: imgData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.code) {
        setCode(res.data.code); 
        setChat(prev => [...prev, { role: "ai", content: "Design updated successfully. Review the changes in the preview." }]);
      }
    } catch (error) {
      setChat(prev => [...prev, { role: "ai", content: "Error: Generation failed." }]);
    } finally { setLoading(false); }
  };

  if (!website) return (
    <div className="h-screen bg-[#09090b] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-zinc-500 font-medium animate-pulse">Initializing Studio...</span>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#fafafa] text-zinc-900 font-sans selection:bg-indigo-100">
      
      {/* --- TOP NAVIGATION --- */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/dashboard")} 
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold text-zinc-900">{website.title}</h1>
            <div className="flex items-center gap-1.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Sync Active</span>
            </div>
          </div>
        </div>

        {/* MODE TOGGLE */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
          <button 
            onClick={() => setMode("preview")} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'preview' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <Eye size={14} /> PREVIEW
          </button>
          <button 
            onClick={() => setMode("code")} 
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'code' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500 hover:text-zinc-700'}`}
          >
            <Code2 size={14} /> SOURCE
          </button>
        </div>


      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* --- LEFT CHAT SIDEBAR --- */}
        <aside className="w-[400px] border-r bg-white flex flex-col z-40">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Terminal size={16} />
              </div>
              <span className="text-xs font-bold uppercase tracking-tight text-zinc-400">Assistant</span>
            </div>
            {loading && <RefreshCw size={14} className="animate-spin text-indigo-500" />}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
            {chat.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-sm ${
                  msg.role === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-zinc-100 text-zinc-800 rounded-tl-none border border-zinc-200"
                }`}>
                  {msg.content}
                  {msg.attachedImg && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-white/20">
                      <img src={msg.attachedImg} alt="Reference" className="w-full object-cover max-h-48" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-start gap-2">
                <div className="bg-zinc-100 border border-zinc-200 p-3 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="p-4 bg-white border-t">
            {selectedImage && (
              <div className="relative inline-block mb-3 group">
                <img src={selectedImage} className="w-16 h-16 rounded-xl object-cover border-2 border-indigo-500 shadow-lg" />
                <button 
                  onClick={() => setSelectedImage(null)} 
                  className="absolute -top-2 -right-2 bg-zinc-900 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                >
                  <X size={12}/>
                </button>
              </div>
            )}
            <div className="flex items-end gap-2 bg-zinc-50 border border-zinc-200 p-2 rounded-2xl focus-within:ring-2 ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-inner">
              <button 
                onClick={() => fileInputRef.current.click()}
                className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
              >
                <Paperclip size={20} />
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              <textarea 
                rows={1}
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendChat())}
                placeholder="Describe design changes..." 
                className="flex-1 bg-transparent py-2 px-1 text-sm outline-none resize-none max-h-32" 
              />
              <button 
                onClick={sendChat} 
                disabled={loading} 
                className={`p-2 rounded-xl transition-all ${loading ? 'bg-zinc-200 text-zinc-400' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:scale-95'}`}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </aside>

        {/* --- MAIN WORKSPACE --- */}
        <main className="flex-1 bg-zinc-100 relative overflow-hidden flex flex-col items-center">
          
          {/* FLOATING VIEWPORT SELECTOR */}
          <div className="mt-4 mb-2 flex items-center gap-1 bg-white border border-zinc-200 p-1 rounded-xl shadow-sm z-10">
            {[
              { id: 'mobile', icon: Smartphone, label: '390px' },
              { id: 'tablet', icon: Tablet, label: '768px' },
              { id: 'desktop', icon: Monitor, label: '100%' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setViewport(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewport === item.id ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:bg-zinc-50'
                }`}
              >
                <item.icon size={14} />
                <span className="hidden lg:block">{item.label}</span>
              </button>
            ))}
          </div>

          {/* DEVICE CANVAS */}
          <div 
            className="flex-1 w-full mb-8 transition-all duration-500 ease-in-out flex flex-col items-center px-4"
          >
            <div 
              className="w-full h-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-zinc-200 overflow-hidden relative"
              style={{ maxWidth: viewport === 'mobile' ? '390px' : viewport === 'tablet' ? '768px' : '100%' }}
            >
              {/* BROWSER CHROME UI */}
              <div className="h-8 bg-zinc-50 border-b flex items-center px-4 gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-200" />
                </div>
                <div className="flex-1 mx-12 bg-white border rounded-md h-5 flex items-center px-2">
                  <span className="text-[10px] text-zinc-300 truncate">localhost:3000/preview</span>
                </div>
              </div>

              {/* OVERLAY LOADER */}
              <AnimatePresence>
                {loading && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center"
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-100 rounded-full" />
                        <div className="absolute top-0 w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Compiling Design</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CONTENT AREA */}
              <div className="w-full h-[calc(100%-32px)] overflow-hidden">
                {mode === 'code' ? (
                  <textarea 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    className="w-full h-full p-6 font-mono text-sm outline-none bg-[#09090b] text-zinc-300 resize-none" 
                  />
                ) : (
                  <iframe 
                    srcDoc={code} 
                    className="w-full h-full border-0" 
                    title="preview" 
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Preview;