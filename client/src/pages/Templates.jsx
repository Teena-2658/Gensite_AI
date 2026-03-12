import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, LayoutDashboard, Search } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
              Explore Templates
            </h1>
            <p className="text-slate-500 font-medium">
              Choose a professionally designed layout to jumpstart your AI website.
            </p>
          </div>
          
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl transition-all font-bold text-sm shadow-sm text-slate-700"
          >
            <LayoutDashboard size={18} className="text-blue-600" />
            Back to Dashboard
          </button>
        </div>

      

        {/* GRID CONFIGURATION */}      
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {TEMPLATES_DATA.map((template) => (
            <div 
              key={template.id}
              onClick={() => handleSelect(template)}
              className="group cursor-pointer bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-500 flex flex-col shadow-sm"
            >
              {/* --- IMAGE SECTION --- */}
              <div className="relative h-56 overflow-hidden bg-slate-100 border-b border-slate-100">
                <img 
                  src={template.image} 
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1460925895917?q=80&w=800"; }}
                />
                
                {/* Badge Overlay */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-md border border-white p-2 rounded-xl shadow-lg">
                    <Sparkles size={16} className="text-blue-600" />
                  </div>
                </div>

                {/* Hover Play Button Style Overlay */}
                <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <div className="bg-white px-4 py-2 rounded-full shadow-xl text-blue-600 font-bold text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform">
                      Use Template
                   </div>
                </div>
              </div>

              {/* --- CONTENT SECTION --- */}
              <div className="p-7 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {template.name}
                  </h3>
                  <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-wider">
                    PRO
                  </span>
                </div>
                
                <p className="text-slate-500 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                  {template.description || "Fully responsive AI generated layout for your business."}
                </p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Multi-page
                  </span>
                  <div className="bg-slate-50 group-hover:bg-blue-600 p-2.5 rounded-xl transition-all transform group-hover:scale-110 group-hover:text-white text-slate-400 shadow-sm">
                    <ArrowRight size={18} />
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