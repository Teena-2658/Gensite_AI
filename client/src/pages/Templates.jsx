import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, LayoutDashboard } from 'lucide-react';
import { TEMPLATES_DATA } from '../constants';

const Templates = () => {
  const navigate = useNavigate();

  const handleSelect = (template) => {
    navigate("/dashboard", { 
      state: { 
        selectedPrompt: template.prompt,
        selectedImage: template.image 
      } 
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER SECTION WITH BACK BUTTON */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Templates</h1>
            <p className="text-slate-400">Select a starting point for your next AI website.</p>
          </div>
          
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all font-medium text-sm"
          >
            <LayoutDashboard size={18} />
            Back to Dashboard
          </button>
        </div>

        {/* GRID CONFIGURATION: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {TEMPLATES_DATA.map((template) => (
            <div 
              key={template.id}
              onClick={() => handleSelect(template)}
              className="group cursor-pointer bg-[#0f1115] border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all duration-300 flex flex-col"
            >
              {/* --- IMAGE SECTION --- */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img 
                  src={template.image} 
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-70 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] to-transparent opacity-40" />
                
                <div className="absolute top-3 left-3">
                  <div className="bg-black/40 backdrop-blur-md border border-white/10 p-1.5 rounded-lg">
                    <Sparkles size={14} className="text-blue-400" />
                  </div>
                </div>
              </div>

              {/* --- CONTENT SECTION --- */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                  {template.name}
                </h3>
                <p className="text-slate-500 text-xs font-medium mb-4 line-clamp-2">
                  {template.description}
                </p>
                
                <div className="mt-auto flex justify-end">
                  <div className="bg-slate-800 group-hover:bg-blue-600 p-2 rounded-lg transition-all transform group-hover:translate-x-1">
                    <ArrowRight size={16} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;