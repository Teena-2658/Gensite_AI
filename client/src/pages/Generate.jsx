import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Generate = () => {
  const location = useLocation();
  const [userPrompt, setUserPrompt] = useState("");
  const [templateImg, setTemplateImg] = useState(null); // Image store karne ke liye

  useEffect(() => {
    if (location.state) {
      if (location.state.selectedPrompt) {
        setUserPrompt(location.state.selectedPrompt);
      }
      if (location.state.selectedImage) {
        setTemplateImg(location.state.selectedImage);
      }
    }
  }, [location.state]);

  return (
    <div className="p-8">
      {/* Agar template image hai toh preview dikhao */}
      {templateImg && (
        <div className="mb-6 max-w-sm rounded-xl overflow-hidden border border-zinc-700">
          <p className="text-xs text-zinc-500 p-2 bg-zinc-800">Selected Template Preview:</p>
          <img src={templateImg} alt="Selected Template" className="w-full h-auto" />
        </div>
      )}

      <textarea 
        className="w-full p-4 bg-zinc-900 text-white rounded-lg border border-zinc-700"
        value={userPrompt} 
        onChange={(e) => setUserPrompt(e.target.value)}
        placeholder="Describe your website..."
      />
    </div>
  );
};

export default Generate;