import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const TemplateCard = ({ template }) => {
    console.log("Template Image URL:", template.image);
  const navigate = useNavigate();

  const handleSelect = () => {
    // Yahan hum image aur prompt dono state mein bhej rahe hain
    navigate('/dashboard', { 
      state: { 
        selectedPrompt: template.prompt,
        selectedImage: template.image // Naya field image ke liye
      } 
    });
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={handleSelect}
      className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden cursor-pointer hover:border-zinc-600 transition-all group"
    >
      {/* Template Image Section (Similar to your screenshot) */}
      <div className="aspect-[16/10] overflow-hidden bg-zinc-800">
        <img 
          src={template.image} 
          alt={template.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Text Section */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-white mb-2">{template.name}</h3>
        <p className="text-zinc-400 text-sm">
          {template.description}
        </p>
      </div>
    </motion.div>
  );
};

export default TemplateCard;