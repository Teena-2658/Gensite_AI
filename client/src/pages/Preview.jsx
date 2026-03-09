import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;

  const [website, setWebsite] = useState(null);
  const [code, setCode] = useState("");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const API_URL = "http://localhost:8000/api/website";

  // Fetch website
  useEffect(() => {
    const fetchWebsite = async () => {
      try {
        const res = await axios.get(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        const websiteData = res.data.website || res.data;

        setWebsite(websiteData);
        setCode(websiteData.latestCode || "");

        if (websiteData.conversation && Array.isArray(websiteData.conversation)) {
          setChat([...websiteData.conversation]); // Create new array instance for proper re-render
        }

      } catch (error) {
        console.error("Fetch error:", error);
        alert("Failed to load website");
      }
    };

    if (token && id) {
      fetchWebsite();
    }
  }, [id, token]);

  // Detect theme request
  const detectThemeRequest = (message) => {
    const themes = [
      "theme",
      "design",
      "modern",
      "gradient",
      "dark",
      "light",
      "style",
      "change",
      "update",
      "color",
      "button",
      "font",
      "layout"
    ];

    return themes.some(word =>
      message.toLowerCase().includes(word)
    );
  };

  // Send chat and save to MongoDB
  const sendChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };
    const inputValue = chatInput;
    
    // Immediately update UI with user message
    setChat(prevChat => [...prevChat, userMessage]);
    setChatInput("");
    setLoading(true);

    try {
      if (detectThemeRequest(inputValue)) {
        
        // Call generate endpoint which will handle MongoDB save
        const res = await axios.post(
          `${API_URL}/generate`,
          {
            prompt: `${website.title}. User request: ${inputValue}`,
            websiteId: id
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );

        if (res.data.code) {

          // Update code and preview
          setCode(res.data.code);
          setIframeKey(prev => prev + 1);

          // Add AI response to chat
          const aiMessage = {
            role: "ai",
            content: `✨ Website updated! Changes applied: ${inputValue}`
          };

          setChat(prevChat => [...prevChat, aiMessage]);

          console.log("✅ Chat saved to MongoDB via generate endpoint");
        }

      } else {

        const aiMessage = {
          role: "ai",
          content:
            "Please describe design or style changes (example: make it dark, add gradient, change button color)."
        };

        setChat(prevChat => [...prevChat, aiMessage]);

      }

    } catch (error) {

      console.error("Chat error:", error);

      const errorMessage = {
        role: "ai",
        content: "Something went wrong. Please try again."
      };

      setChat(prevChat => [...prevChat, errorMessage]);

    } finally {
      setLoading(false);
    }
  };

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Loading website...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* Navbar */}
      <header className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">

        <div className="flex items-center gap-4">

          <button
            onClick={() => navigate("/dashboard")}
            className="px-3 py-1 bg-gray-200 rounded"
          >
            ← Back
          </button>

          <h1 className="text-xl font-bold">
            {website.title}
          </h1>

        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Save & Exit
        </button>

      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">

        {/* Chat */}
        <div className="w-80 bg-white border-r flex flex-col">

          <div className="p-4 border-b">
            <h2 className="font-bold">💬 AI Assistant</h2>
            <p className="text-xs text-gray-500">{chat.length} messages</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {chat.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Start chatting to edit website
              </p>
            ) : (
              chat.map((msg, idx) => (

                <div
                  key={idx}
                  className={`p-3 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-blue-100 ml-4 text-right"
                      : "bg-gray-100 mr-4"
                  }`}
                >
                  {msg.content}
                </div>

              ))
            )}

          </div>

          <div className="p-4 border-t flex gap-2">

            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !loading && sendChat()
              }
              className="flex-1 border rounded px-3 py-2 text-sm"
              placeholder="Describe changes..."
              disabled={loading}
            />

            <button
              onClick={sendChat}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
            >
              {loading ? "..." : "Send"}
            </button>

          </div>

        </div>

        {/* Preview / Code */}
        <div className="flex-1 flex flex-col">

          <div className="bg-white border-b px-6 py-3 flex justify-between items-center">

            <h2 className="font-bold">
              {codeEditorOpen ? "Code Editor" : "Live Preview"}
            </h2>

            <button
              onClick={() =>
                setCodeEditorOpen(!codeEditorOpen)
              }
              className="px-3 py-1 bg-gray-200 rounded"
            >
              {codeEditorOpen ? "Preview" : "Code"}
            </button>

          </div>

          <div className="flex-1">

            {codeEditorOpen ? (

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-full p-4 font-mono text-sm border-0"
              />

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

      </div>

    </div>
  );
};

export default Preview;