import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { RefreshCw, Download, Eye, Code2, ChevronLeft, Send, Zap } from "lucide-react";
import { serverUrl } from "../constants";

const Preview = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const chatEndRef = useRef(null);
  const [isReloading, setIsReloading] = useState(false);
  const textareaRef = useRef(null);
const [showCreditPopup, setShowCreditPopup] = useState(false);
  const [website, setWebsite] = useState(null);
  const [code, setCode] = useState("");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("preview");
  const [renderKey, setRenderKey] = useState(Date.now());
  const [credits, setCredits] = useState(0);

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;

  const API_URL = `${serverUrl}/api/website`;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [chatInput]);

  useEffect(() => {
    if (userData?.credits !== undefined)
      setCredits(userData.credits);

    const fetchWebsite = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = res.data.website || res.data;

        setWebsite(data);
        setCode(data.latestCode || "");

        if (data.conversation)
          setChat(data.conversation);

      } catch {
        navigate("/dashboard");
      }
    };

    if (token && id)
      fetchWebsite();

  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, loading]);

  const downloadAsZip = async () => {
    const zip = new JSZip();

    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "text/html");

    const styleContent = doc.querySelector("style")?.innerHTML || "/* No CSS */";
    const scriptContent = doc.querySelector("script")?.innerHTML || "// No JS";

    doc.querySelectorAll("style").forEach(s => s.remove());
    doc.querySelectorAll("script").forEach(s => s.remove());

    const link = doc.createElement("link");
    link.rel = "stylesheet";
    link.href = "styles.css";
    doc.head.appendChild(link);

    const script = doc.createElement("script");
    script.src = "script.js";
    doc.body.appendChild(script);

    zip.file("index.html", "<!DOCTYPE html>\n" + doc.documentElement.outerHTML);
    zip.file("styles.css", styleContent);
    zip.file("script.js", scriptContent);

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, `${website?.title || "gensite"}.zip`);
  };

 const sendChat = async () => {

  if (!chatInput.trim() || loading) return;

  // ✅ CREDIT CHECK (FRONTEND LEVEL)
 if (credits < 25) {
  setShowCreditPopup(true);
  return;
}

  const input = chatInput;

  setChat(prev => [...prev, { role: "user", content: input }]);

  setChatInput("");
  setLoading(true);
  setIsReloading(true); // 🔥 trigger UI reload effect

  try {

    const response = await fetch(`${API_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ prompt: input, websiteId: id })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop();

      for (const event of events) {
        if (!event.startsWith("data:")) continue;

        const data = JSON.parse(event.replace("data:", "").trim());

        // ✅ CREDIT ERROR POPUP
        if (data.error && data.type === "CREDIT_ERROR") {
          setShowCreditPopup(true);
          setLoading(false);
          setIsReloading(false);
          return;
        }

        // ✅ CHAT UPDATE
        if (data.message) {
          setChat(prev => {
            const last = prev[prev.length - 1];

            if (last && last.role === "ai") {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...last,
                content: data.message
              };
              return updated;
            }

            return [...prev, { role: "ai", content: data.message }];
          });
        }

        // 🔥 FULL UI REFRESH EFFECT
        if (data.code) {
          setCode(""); // clear first (forces reload)
          
          setTimeout(() => {
            setCode(data.code);
            setRenderKey(Date.now());
            setIsReloading(false);
          }, 300); // slight delay for visible refresh
        }

        if (data.remainingCredits !== undefined) {
          setCredits(data.remainingCredits);

          const updatedUser = {
            ...userData,
            credits: data.remainingCredits
          };

          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }
    }

  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  } finally {
    setLoading(false);
  }
};

  if (!website)
    return (
      <div className="h-screen flex items-center justify-center">
        
        <RefreshCw className="animate-spin" />
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-[#fafafa]">
{showCreditPopup && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 w-[320px] text-center shadow-xl">

      <div className="text-xl font-bold mb-2">⚡ Not Enough Credits</div>

      <p className="text-sm text-gray-600 mb-4">
        You need at least <b>25 credits</b> to update this website.
      </p>

      <button
        onClick={() => setShowCreditPopup(false)}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg"
      >
        OK
      </button>

    </div>
  </div>
)}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4">

        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")}>
            <ChevronLeft />
          </button>
          <h1 className="text-sm font-bold">{website.title}</h1>
        </div>

        <div className="flex items-center gap-4">

          <button onClick={downloadAsZip} className="flex items-center gap-2 px-3 py-1.5 bg-black text-white rounded">
            <Download size={14} /> DOWNLOAD ZIP
          </button>

          <button onClick={() => setMode("preview")}> <Eye size={14} /> PREVIEW </button>
          <button onClick={() => setMode("code")}> <Code2 size={14} /> SOURCE </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 rounded-full">
            <Zap size={14} />
            <span>{credits}</span>
          </div>

        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        <aside className="w-[380px] border-r flex flex-col">

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chat.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-4 py-3 rounded-xl text-sm ${msg.role === "user" ? "bg-indigo-600 text-white" : "bg-gray-100"}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t">
            <textarea
              ref={textareaRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendChat())}
              placeholder="Describe changes..."
              className="w-full border p-2 rounded resize-none"
            />

            <button onClick={sendChat} disabled={loading} className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
              {loading ? <RefreshCw className="animate-spin" size={14} /> : "Generate"}
              <Send size={14} />
            </button>
          </div>

        </aside>

        <main className="flex-1 p-6">
          {mode === "preview" ? (
<div className="relative w-full h-full">

  {isReloading && (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
      <div className="flex flex-col items-center gap-2">
        <RefreshCw className="animate-spin" />
        <span className="text-sm">Updating UI...</span>
      </div>
    </div>
  )}

  <iframe
    key={renderKey}
    srcDoc={code}
    className="w-full h-full border"
    title="preview"
  />
</div>          ) : (
            <pre className="h-full bg-black text-green-400 p-6 overflow-auto">
              <code>{code}</code>
            </pre>
          )}
        </main>

      </div>

    </div>
  );
};

export default Preview;
