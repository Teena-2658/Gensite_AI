import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TemplateCard = ({ template }) => {
  const navigate = useNavigate();

  const handleSelect = (e) => {
    e.preventDefault();
    
    // Debugging: Console check karo click ho raha hai ya nahi
    console.log("Navigating to dashboard with:", template.prompt);

    navigate('/dashboard', { 
      state: { autoPrompt: template.prompt },
      replace: false // Isse false rakhein taaki history bani rahe
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={handleSelect}
      className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl cursor-pointer hover:border-blue-500/50 transition-all group"
    >
      <div className="text-blue-500 mb-4 text-2xl group-hover:glow-blue">
         {/* Make sure template.icon is rendered properly */}
         {template.icon || "✨"} 
      </div>
      <h3 className="text-xl font-bold mb-2 text-white">{template.name}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">
        {template.description || `Build your ${template.name} with AI.`}
      </p>
    </motion.div>
  );
};

export default TemplateCard;