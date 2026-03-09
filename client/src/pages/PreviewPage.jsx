import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user"));
  const token = userData?.token;

  const API_URL = "http://localhost:8000/api/website";

  const [website, setWebsite] = useState(null);
  const [code, setCode] = useState("");
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeEditorOpen, setCodeEditorOpen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

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

        if (websiteData.conversation) {
          setChat(websiteData.conversation);
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

  const detectThemeRequest = (message) => {
    const themes = [
      "convert",
      "theme",
      "design",
      "modern",
      "gradient",
      "dark",
      "light",
      "style",
      "change",
      "update"
    ];

    return themes.some((word) =>
      message.toLowerCase().includes(word)
    );
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { role: "user", content: chatInput };

    setChat((prev) => [...prev, userMessage]);
    setChatInput("");
    setLoading(true);

    try {
      if (detectThemeRequest(chatInput)) {
        console.log("🎨 Design request detected, calling generate endpoint...");
        console.log("Sending:", { 
          websiteId: id, 
          prompt: `${website.title}. User request: ${chatInput}` 
        });

        const res = await axios.post(
          `${API_URL}/generate`,
          {
            prompt: `${website.title}. User request: ${chatInput}`,
            websiteId: id
          },
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        );

        console.log("✅ Generate API succeeded:", res.data);

        if (res.data.code) {
          setCode(res.data.code);
          setIframeKey((prev) => prev + 1);

          const aiMessage = {
            role: "ai",
            content: `✨ Website updated! Applied changes: ${chatInput}`
          };

          setChat((prev) => [...prev, aiMessage]);
          console.log("✅ Chat message added successfully");
        }
      } else {
        const aiMessage = {
          role: "ai",
          content:
            "Please describe design or style changes like colors, layout, theme etc."
        };

        setChat((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error("❌ Chat error:", error.message);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Full error:", error);

      const aiMessage = {
        role: "ai",
        content: "Something went wrong while updating the website."
      };

      setChat((prev) => [...prev, aiMessage]);
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

      {/* HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center gap-3">
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
        </div>
      </header>

      {/* MAIN */}
      <div className="flex flex-1 overflow-hidden">

        {/* CHAT PANEL */}
        <div className="w-80 bg-white border-r flex flex-col">

          <div className="p-4 border-b">
            <h2 className="font-bold">AI Assistant</h2>
            <p className="text-sm text-gray-500">
              Ask changes for your website
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chat.length === 0 ? (
              <p className="text-gray-400 text-sm">
                Start chatting to update your website
              </p>
            ) : (
              chat.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${
                    msg.role === "user"
                      ? "bg-blue-100 ml-4"
                      : "bg-gray-100 mr-4"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
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
                e.key === "Enter" && sendChat()
              }
              placeholder="Describe changes..."
              className="flex-1 border px-3 py-2 rounded text-sm"
            />

            <button
              onClick={sendChat}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col">

          <div className="bg-white border-b px-6 py-3 flex justify-between items-center">
            <h2 className="font-bold">
              {codeEditorOpen ? "Code Editor" : "Live Preview"}
            </h2>

            <button
              onClick={() => setCodeEditorOpen(!codeEditorOpen)}
              className="px-3 py-1 bg-gray-200 rounded"
            >
              {codeEditorOpen ? "Preview" : "Code"}
            </button>
          </div>

          <div className="flex-1 overflow-hidden">

            {codeEditorOpen ? (
              <div className="flex flex-col h-full">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 p-4 font-mono text-sm"
                />

                <div className="p-4 border-t">
                  <button
                    onClick={() => {
                      setIframeKey((prev) => prev + 1);
                      setCodeEditorOpen(false);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    Preview Changes
                  </button>
                </div>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                srcDoc={code}
                title="preview"
                className="w-full h-full border-0 bg-white"
              />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Preview;