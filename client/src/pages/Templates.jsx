
import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, LayoutDashboard } from "lucide-react";
import { TEMPLATES_DATA } from "../constants";

const Templates = () => {
  const navigate = useNavigate();

  const handleSelect = (template) => {
    navigate("/dashboard", {
      state: {
        selectedPrompt: template.prompt,
        selectedImage: template.image,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050816] via-[#0a1125] to-[#050816] text-white font-sans p-6 md:p-10">
      <div className="max-w-[1600px] mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              Explore Templates
            </h1>
            <p className="text-slate-400 font-medium">
              Choose a professionally designed layout to jumpstart your AI website.
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 bg-[#0f172a] hover:bg-[#1e293b] border border-slate-700 rounded-2xl transition-all font-bold text-sm shadow-sm"
          >
            <LayoutDashboard size={18} className="text-blue-400" />
            Back to Dashboard
          </button>
        </div>

        {/* TEMPLATE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {TEMPLATES_DATA.map((template) => (
            <div
              key={template.id}
              onClick={() => handleSelect(template)}
              className="group cursor-pointer bg-[#0f172a] border border-slate-700 rounded-[2.5rem] overflow-hidden hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-500 flex flex-col"
            >
              {/* IMAGE */}
              <div className="relative h-56 overflow-hidden bg-slate-900 border-b border-slate-800">
                <img
                  src={template.image}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src =
                      "https://images.unsplash.com/photo-1460925895917?q=80&w=800";
                  }}
                />

                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 backdrop-blur-md border border-white p-2 rounded-xl shadow-lg">
                    <Sparkles size={16} className="text-blue-600" />
                  </div>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-white text-blue-600 px-4 py-2 rounded-full shadow-xl font-bold text-xs transform translate-y-4 group-hover:translate-y-0 transition-transform">
                    Use Template
                  </div>
                </div>
              </div>

              {/* CONTENT */}
              <div className="p-7 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                    {template.name}
                  </h3>

                  <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-2 py-1 rounded-md uppercase tracking-wider">
                    PRO
                  </span>
                </div>

                <p className="text-slate-400 text-sm font-medium mb-6 line-clamp-2 leading-relaxed">
                  {template.description ||
                    "Fully responsive AI generated layout for your business."}
                </p>

                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Multi-page
                  </span>

                  <div className="bg-[#020617] group-hover:bg-blue-600 p-2.5 rounded-xl transition-all transform group-hover:scale-110 group-hover:text-white text-slate-400 shadow-sm">
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

