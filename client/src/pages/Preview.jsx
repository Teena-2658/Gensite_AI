// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";

// const Preview = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const userData = JSON.parse(localStorage.getItem("user"));
//   const token = userData?.token;

//   const [website, setWebsite] = useState(null);
//   const [code, setCode] = useState("");
//   const [chat, setChat] = useState([]);
//   const [chatInput, setChatInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [codeEditorOpen, setCodeEditorOpen] = useState(false);
//   const [iframeKey, setIframeKey] = useState(0);
//   const [codeSaving, setCodeSaving] = useState(false);

//   const API_URL = "http://localhost:8000/api/website";

//   // Fetch website
//   useEffect(() => {
//     const fetchWebsite = async () => {
//       try {
//         const res = await axios.get(`${API_URL}/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true
//         });

//         const websiteData = res.data.website || res.data;

//         setWebsite(websiteData);
//         setCode(websiteData.latestCode || "");

//         if (websiteData.conversation) {
//           setChat(websiteData.conversation);
//         }

//       } catch (error) {
//         console.error("Fetch error:", error);
//         alert("Failed to load website");
//       }
//     };

//     if (token && id) {
//       fetchWebsite();
//     }
//   }, [id, token]);

//   // Detect theme request
//   const detectThemeRequest = (message) => {
//     const themes = [
//       "theme",
//       "design",
//       "modern",
//       "gradient",
//       "dark",
//       "light",
//       "style",
//       "change",
//       "update"
//     ];

//     return themes.some(word =>
//       message.toLowerCase().includes(word)
//     );
//   };

//   // Send chat
//   const sendChat = async () => {
//     if (!chatInput.trim()) return;

//     const userMessage = { role: "user", content: chatInput };
//     setChat(prev => [...prev, userMessage]);

//     setChatInput("");
//     setLoading(true);

//     try {
//       if (detectThemeRequest(chatInput)) {

//         const res = await axios.post(
//           `${API_URL}/generate`,
//           {
//             prompt: `${website.title}. User request: ${chatInput}`,
//             websiteId: id
//           },
//           {
//             headers: { Authorization: `Bearer ${token}` },
//             withCredentials: true
//           }
//         );

//         if (res.data.code) {

//           setCode(res.data.code);
//           setIframeKey(prev => prev + 1);

//           const aiMessage = {
//             role: "ai",
//             content: `✨ Website updated! Changes applied: ${chatInput}`
//           };

//           setChat(prev => [...prev, aiMessage]);
//         }

//       } else {

//         const aiMessage = {
//           role: "ai",
//           content:
//             "Please describe design or style changes (example: make it modern, add gradient, dark theme)."
//         };

//         setChat(prev => [...prev, aiMessage]);

//       }

//     } catch (error) {

//       console.error("Chat error:", error);

//       const errorMessage = {
//         role: "ai",
//         content: "Something went wrong. Please try again."
//       };

//       setChat(prev => [...prev, errorMessage]);

//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!website) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-100">
//         <p>Loading website...</p>
//       </div>
//     );
//   }

//   // Save code to MongoDB
//   const saveCode = async () => {
//     try {
//       setCodeSaving(true);
//       await axios.put(
//         `${API_URL}/${id}/code`,
//         { code },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true
//         }
//       );
//       alert("Code saved successfully!");
//     } catch (error) {
//       console.error("Save code error:", error);
//       alert("Failed to save code");
//     } finally {
//       setCodeSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-100">

//       {/* Navbar */}
//       <header className="bg-white border-b shadow-sm px-6 py-4 flex justify-between items-center">

//         <div className="flex items-center gap-4">

//           <button
//             onClick={() => navigate("/dashboard")}
//             className="px-3 py-1 bg-gray-200 rounded"
//           >
//             ← Back
//           </button>

//           <h1 className="text-xl font-bold">
//             {website.title}
//           </h1>

//         </div>

//         <button
//           onClick={() => navigate("/dashboard")}
//           className="px-4 py-2 bg-blue-600 text-white rounded"
//         >
//           Save & Exit
//         </button>

//       </header>

//       {/* Main */}
//       <div className="flex flex-1 overflow-hidden">

//         {/* Chat */}
//         <div className="w-80 bg-white border-r flex flex-col">

//           <div className="p-4 border-b">
//             <h2 className="font-bold">💬 AI Assistant</h2>
//           </div>

//           <div className="flex-1 overflow-y-auto p-4 space-y-3">

//             {chat.length === 0 ? (
//               <p className="text-gray-400 text-sm">
//                 Start chatting to edit website
//               </p>
//             ) : (
//               chat.map((msg, idx) => (

//                 <div
//                   key={idx}
//                   className={`p-3 rounded-lg ${
//                     msg.role === "user"
//                       ? "bg-blue-100 ml-4"
//                       : "bg-gray-100 mr-4"
//                   }`}
//                 >
//                   {msg.content}
//                 </div>

//               ))
//             )}

//           </div>

//           <div className="p-4 border-t flex gap-2">

//             <input
//               type="text"
//               value={chatInput}
//               onChange={(e) => setChatInput(e.target.value)}
//               onKeyDown={(e) =>
//                 e.key === "Enter" && sendChat()
//               }
//               className="flex-1 border rounded px-3 py-2 text-sm"
//               placeholder="Describe changes..."
//             />

//             <button
//               onClick={sendChat}
//               disabled={loading}
//               className="px-4 py-2 bg-blue-600 text-white rounded"
//             >
//               Send
//             </button>

//           </div>

//         </div>

//         {/* Preview / Code */}
//         <div className="flex-1 flex flex-col">

//           <div className="bg-white border-b px-6 py-3 flex justify-between items-center">

//             <h2 className="font-bold">
//               {codeEditorOpen ? "Code Editor" : "Live Preview"}
//             </h2>

//             <div className="flex gap-2">
//               {codeEditorOpen && (
//                 <button
//                   onClick={saveCode}
//                   disabled={codeSaving}
//                   className="px-3 py-1 bg-green-600 text-white rounded text-sm"
//                 >
//                   {codeSaving ? "Saving..." : "Save Code"}
//                 </button>
//               )}
//               <button
//                 onClick={() =>
//                   setCodeEditorOpen(!codeEditorOpen)
//                 }
//                 className="px-3 py-1 bg-gray-200 rounded"
//               >
//                 {codeEditorOpen ? "Preview" : "Code"}
//               </button>
//             </div>

//           </div>

//           <div className="flex-1">

//             {codeEditorOpen ? (

//               <textarea
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 className="w-full h-full p-4 font-mono text-sm"
//               />

//             ) : (

//               <iframe
//                 key={iframeKey}
//                 srcDoc={code}
//                 title="preview"
//                 className="w-full h-full border-0"
//               />

//             )}

//           </div>

//         </div>

//       </div>

//     </div>
//   );
// };

// export default Preview;