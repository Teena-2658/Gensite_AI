import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Monitor, Smartphone, Tablet, 
  Terminal, Paperclip, X, Zap, Code2, Eye, 
  ChevronLeft, RefreshCw, Download, Copy, Check 
} from "lucide-react";
import { serverUrl } from "../constants";

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const [website, setWebsite] = useState(null);
  const [code, setCode] = useState(""); 
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("preview"); 
  const [renderKey, setRenderKey] = useState(Date.now());
  const [credits, setCredits] = useState(0);
  const [copied, setCopied] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;
  const API_URL = `${serverUrl}/api/website`;

  // --- AUTO-RESIZE TEXTAREA LOGIC ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [chatInput]);

  useEffect(() => {
    if (userData?.credits !== undefined) setCredits(userData.credits);
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const downloadAsZip = async () => {
    const zip = new JSZip();
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "text/html");
    
    const styleContent = doc.querySelector("style")?.innerHTML || "/* No custom CSS */";
    const scriptContent = doc.querySelector("script")?.innerHTML || "// No custom JS";
    
    doc.querySelectorAll("style").forEach(s => s.remove());
    doc.querySelectorAll("script").forEach(s => s.remove());
    
    const link = doc.createElement("link");
    link.rel = "stylesheet"; link.href = "styles.css";
    doc.head.appendChild(link);
    
    const scriptTag = doc.createElement("script");
    scriptTag.src = "script.js";
    doc.body.appendChild(scriptTag);

    zip.file("index.html", "<!DOCTYPE html>\n" + doc.documentElement.outerHTML);
    zip.file("styles.css", styleContent);
    zip.file("script.js", scriptContent);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${website?.title || "gensite"}-project.zip`);
  };

  const sendChat = async () => {
    if ((!chatInput.trim()) || loading) return;
    const input = chatInput;
    setChat(prev => [...prev, { role: "user", content: input }]);
    setChatInput(""); // Clear input
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prompt: input, websiteId: id }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.replace("data: ", ""));
            if (data.done) {
              setCode(data.code);
              setRenderKey(Date.now());
              if (data.remainingCredits !== undefined) {
                setCredits(data.remainingCredits);
                localStorage.setItem("user", JSON.stringify({ ...userData, credits: data.remainingCredits }));
              }
              setChat(prev => [...prev, { role: "ai", content: "Design updated!" }]);
            }
          }
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (!website) return <div className="h-screen bg-[#09090b] flex items-center justify-center"><RefreshCw className="animate-spin text-white" /></div>;

  return (
    <div className="h-screen flex flex-col bg-[#fafafa] text-zinc-900 overflow-hidden font-sans">
      <header className="h-14 border-b bg-white flex items-center justify-between px-4 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="p-2 hover:bg-zinc-100 rounded-lg"><ChevronLeft size={20} /></button>
          <h1 className="text-sm font-bold tracking-tight">{website.title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={downloadAsZip} className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:shadow-lg transition-all active:scale-95">
            <Download size={14} /> DOWNLOAD ZIP
          </button>

          <div className="flex items-center bg-zinc-100 p-1 rounded-xl">
            <button onClick={() => setMode("preview")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'preview' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500'}`}>
              <Eye size={14} className="inline mr-2" /> PREVIEW
            </button>
            <button onClick={() => setMode("code")} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === 'code' ? 'bg-white shadow-sm text-indigo-600' : 'text-zinc-500'}`}>
              <Code2 size={14} className="inline mr-2" /> SOURCE
            </button>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full">
            <Zap size={14} className="text-indigo-600 fill-indigo-600" />
            <span className="text-xs font-bold text-indigo-700">{credits}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[400px] border-r bg-white flex flex-col shadow-sm">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-800"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* DYNAMIC TEXTAREA AREA */}
          <div className="p-4 border-t bg-white">
            <div className="flex flex-col gap-2 bg-zinc-50 border border-zinc-200 p-3 rounded-2xl focus-within:border-indigo-500 transition-all">
              <textarea 
                ref={textareaRef}
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendChat())}
                placeholder="Describe the changes (e.g., 'Make the header sticky')..." 
                className="w-full bg-transparent text-sm outline-none resize-none min-h-[40px] max-h-[300px] leading-relaxed" 
                rows={1}
              />
              <div className="flex justify-between items-center pt-2 border-t border-zinc-200">
                <button className="p-2 text-zinc-400 hover:text-indigo-600 transition-colors"><Paperclip size={18}/></button>
                <button 
                  onClick={sendChat} 
                  disabled={loading || !chatInput.trim()} 
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-300 text-white px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                >
                  {loading ? <RefreshCw className="animate-spin" size={12} /> : "GENERATE"}
                  {!loading && <Send size={12} />}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 bg-zinc-100 p-6 overflow-hidden flex flex-col">
          <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden relative border border-zinc-200">
            {mode === "preview" ? (
              <>
                <AnimatePresence>
                  {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center">
                      <RefreshCw className="animate-spin text-indigo-600 mb-2" size={32} />
                      <p className="text-[10px] font-bold tracking-widest text-indigo-600 uppercase">Updating Canvas...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
                <iframe key={renderKey} srcDoc={code} className="w-full h-full border-0" title="preview" />
              </>
            ) : (
              <div className="flex flex-col h-full bg-[#0d0d0e]">
                <div className="flex items-center justify-between px-6 py-3 bg-[#161617] border-b border-white/5">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Editor / index.html</span>
                  <button onClick={() => {
                    navigator.clipboard.writeText(code);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }} className="text-zinc-400 hover:text-white transition-all bg-white/5 px-3 py-1 rounded-md border border-white/10">
                    <span className="text-[10px] font-bold">{copied ? "COPIED!" : "COPY CODE"}</span>
                  </button>
                </div>
                <pre className="p-8 text-[13px] font-mono text-indigo-300/80 overflow-auto selection:bg-indigo-500/30"><code>{code}</code></pre>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Preview;